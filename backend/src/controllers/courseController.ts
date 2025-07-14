import { Request, Response } from 'express';
import Course, { ICourse } from '../models/Course';
import { AuthRequest } from '../middleware/auth';

export class CourseController {
  public static async createCourse(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      if (!['teacher', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'Only teachers and admins can create courses'
        });
      }

      const {
        title,
        description,
        shortDescription,
        category,
        subcategory,
        tags = [],
        thumbnail,
        previewVideo,
        language,
        difficulty,
        pricing,
        prerequisites = [],
        requirements,
        learningOutcomes,
        skills = [],
        settings
      } = req.body;

      const slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');

      const existingCourse = await Course.findOne({ 'seoData.slug': slug });
      const finalSlug = existingCourse ? `${slug}-${Date.now()}` : slug;

      const courseData = {
        title,
        description,
        shortDescription,
        category,
        subcategory,
        tags,
        instructor: {
          id: req.user._id,
          name: req.user.fullName,
          profilePicture: req.user.profilePicture,
          bio: req.user.bio
        },
        thumbnail,
        previewVideo,
        language,
        difficulty,
        pricing: {
          type: pricing?.type || 'free',
          amount: pricing?.amount || 0,
          currency: pricing?.currency || 'INR',
          discountPrice: pricing?.discountPrice,
          discountEndDate: pricing?.discountEndDate
        },
        prerequisites,
        requirements: {
          educationLevel: requirements?.educationLevel || ['any'],
          subjects: requirements?.subjects || [],
          priorKnowledge: requirements?.priorKnowledge || []
        },
        learningOutcomes,
        skills,
        seoData: {
          metaTitle: title,
          metaDescription: shortDescription,
          keywords: tags,
          slug: finalSlug
        },
        settings: {
          allowComments: settings?.allowComments !== false,
          allowDownloads: settings?.allowDownloads || false,
          allowDiscussions: settings?.allowDiscussions !== false,
          requireEnrollment: settings?.requireEnrollment !== false,
          certificateAvailable: settings?.certificateAvailable || false,
          trackProgress: settings?.trackProgress !== false
        },
        lastModifiedBy: req.user._id
      };

      const course = new Course(courseData);
      await course.save();

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course: {
          id: course._id,
          title: course.title,
          slug: course.seoData.slug,
          status: course.status,
          instructor: course.instructor,
          createdAt: course.createdAt
        }
      });

    } catch (error) {
      console.error('Course creation failed:', error);
      res.status(500).json({
        error: 'Course creation failed',
        message: 'Unable to create course'
      });
    }
  }

  public static async getCourses(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        difficulty,
        language,
        sort = '-createdAt',
        search,
        instructor,
        free
      } = req.query;

      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 50);
      const skip = (pageNum - 1) * limitNum;

      let query: any = { isPublished: true, status: 'published' };

      if (category) query.category = category;
      if (difficulty) query.difficulty = difficulty;
      if (language) query.language = language;
      if (instructor) query['instructor.id'] = instructor;
      if (free === 'true') query['pricing.type'] = 'free';

      let courses;
      let total;

      if (search && typeof search === 'string') {
        [courses, total] = await Promise.all([
          Course.search(search, query)
            .limit(limitNum)
            .skip(skip)
            .populate('instructor.id', 'username profilePicture'),
          Course.find({ ...query, $text: { $search: search } }).countDocuments()
        ]);
      } else {
        const sortOption: any = {};
        if (sort === '-rating') sortOption['analytics.averageRating'] = -1;
        else if (sort === '-popular') sortOption['analytics.enrollmentCount'] = -1;
        else if (sort === '-newest') sortOption.createdAt = -1;
        else if (sort === 'price') sortOption['pricing.amount'] = 1;
        else sortOption.createdAt = -1;

        [courses, total] = await Promise.all([
          Course.find(query)
            .sort(sortOption)
            .limit(limitNum)
            .skip(skip)
            .populate('instructor.id', 'username profilePicture'),
          Course.countDocuments(query)
        ]);
      }

      res.json({
        success: true,
        courses: courses.map(course => ({
          id: course._id,
          title: course.title,
          shortDescription: course.shortDescription,
          category: course.category,
          subcategory: course.subcategory,
          thumbnail: course.thumbnail,
          instructor: course.instructor,
          language: course.language,
          difficulty: course.difficulty,
          totalLessons: course.totalLessons,
          totalDuration: course.totalDuration,
          estimatedCompletion: course.estimatedCompletion,
          pricing: course.pricing,
          effectivePrice: course.effectivePrice,
          analytics: {
            enrollmentCount: course.analytics.enrollmentCount,
            averageRating: course.analytics.averageRating,
            totalRatings: course.analytics.totalRatings
          },
          slug: course.seoData.slug,
          tags: course.tags,
          createdAt: course.createdAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalCourses: total,
          hasNextPage: pageNum * limitNum < total,
          hasPrevPage: pageNum > 1
        }
      });

    } catch (error) {
      console.error('Get courses failed:', error);
      res.status(500).json({
        error: 'Courses retrieval failed',
        message: 'Unable to retrieve courses'
      });
    }
  }

  public static async getCourseById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const course = await Course.findById(id)
        .populate('instructor.id', 'username profilePicture bio')
        .populate('lastModifiedBy', 'username');

      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          message: 'No course found with the provided ID'
        });
      }

      if (!course.isPublished && course.status !== 'published') {
        return res.status(404).json({
          error: 'Course not available',
          message: 'This course is not currently available'
        });
      }

      await course.incrementView();

      res.json({
        success: true,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription,
          category: course.category,
          subcategory: course.subcategory,
          tags: course.tags,
          instructor: course.instructor,
          thumbnail: course.thumbnail,
          previewVideo: course.previewVideo,
          language: course.language,
          difficulty: course.difficulty,
          totalLessons: course.totalLessons,
          totalDuration: course.totalDuration,
          estimatedCompletion: course.estimatedCompletion,
          pricing: course.pricing,
          effectivePrice: course.effectivePrice,
          prerequisites: course.prerequisites,
          requirements: course.requirements,
          learningOutcomes: course.learningOutcomes,
          skills: course.skills,
          analytics: course.analytics,
          completionRate: course.completionRate,
          settings: course.settings,
          seoData: course.seoData,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      });

    } catch (error) {
      console.error('Get course by ID failed:', error);
      res.status(500).json({
        error: 'Course retrieval failed',
        message: 'Unable to retrieve course'
      });
    }
  }

  public static async getCourseBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const course = await Course.findOne({ 'seoData.slug': slug, isPublished: true })
        .populate('instructor.id', 'username profilePicture bio');

      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          message: 'No course found with the provided slug'
        });
      }

      await course.incrementView();

      res.json({
        success: true,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          shortDescription: course.shortDescription,
          category: course.category,
          subcategory: course.subcategory,
          tags: course.tags,
          instructor: course.instructor,
          thumbnail: course.thumbnail,
          previewVideo: course.previewVideo,
          language: course.language,
          difficulty: course.difficulty,
          totalLessons: course.totalLessons,
          totalDuration: course.totalDuration,
          estimatedCompletion: course.estimatedCompletion,
          pricing: course.pricing,
          effectivePrice: course.effectivePrice,
          prerequisites: course.prerequisites,
          requirements: course.requirements,
          learningOutcomes: course.learningOutcomes,
          skills: course.skills,
          analytics: course.analytics,
          completionRate: course.completionRate,
          settings: course.settings,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        }
      });

    } catch (error) {
      console.error('Get course by slug failed:', error);
      res.status(500).json({
        error: 'Course retrieval failed',
        message: 'Unable to retrieve course'
      });
    }
  }

  public static async updateCourse(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const { id } = req.params;
      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          message: 'No course found with the provided ID'
        });
      }

      const isOwner = course.instructor.id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'You can only update your own courses'
        });
      }

      const allowedUpdates = [
        'title', 'description', 'shortDescription', 'category', 'subcategory',
        'tags', 'thumbnail', 'previewVideo', 'language', 'difficulty',
        'pricing', 'prerequisites', 'requirements', 'learningOutcomes',
        'skills', 'settings'
      ];

      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj: any, key: string) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: 'No valid updates provided',
          message: 'Please provide valid fields to update'
        });
      }

      if (updates.title) {
        const slug = updates.title.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
        
        const existingCourse = await Course.findOne({ 
          'seoData.slug': slug,
          _id: { $ne: course._id }
        });
        
        course.seoData.slug = existingCourse ? `${slug}-${Date.now()}` : slug;
        course.seoData.metaTitle = updates.title;
      }

      Object.assign(course, updates);
      course.lastModifiedBy = req.user._id;
      
      await course.save();

      res.json({
        success: true,
        message: 'Course updated successfully',
        course: {
          id: course._id,
          title: course.title,
          slug: course.seoData.slug,
          status: course.status,
          updatedAt: course.updatedAt
        }
      });

    } catch (error) {
      console.error('Course update failed:', error);
      res.status(500).json({
        error: 'Course update failed',
        message: 'Unable to update course'
      });
    }
  }

  public static async deleteCourse(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const { id } = req.params;
      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          message: 'No course found with the provided ID'
        });
      }

      const isOwner = course.instructor.id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'You can only delete your own courses'
        });
      }

      if (course.analytics.enrollmentCount > 0) {
        course.status = 'archived';
        course.isPublished = false;
        await course.save();

        return res.json({
          success: true,
          message: 'Course archived successfully (has enrolled students)'
        });
      } else {
        await Course.findByIdAndDelete(id);

        res.json({
          success: true,
          message: 'Course deleted successfully'
        });
      }

    } catch (error) {
      console.error('Course deletion failed:', error);
      res.status(500).json({
        error: 'Course deletion failed',
        message: 'Unable to delete course'
      });
    }
  }

  public static async publishCourse(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const { id } = req.params;
      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          message: 'No course found with the provided ID'
        });
      }

      const isOwner = course.instructor.id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'You can only publish your own courses'
        });
      }

      await course.publish();

      res.json({
        success: true,
        message: 'Course published successfully',
        course: {
          id: course._id,
          title: course.title,
          status: course.status,
          publishedAt: course.publishedAt
        }
      });

    } catch (error) {
      console.error('Course publishing failed:', error);
      res.status(500).json({
        error: 'Course publishing failed',
        message: 'Unable to publish course'
      });
    }
  }

  public static async unpublishCourse(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const { id } = req.params;
      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).json({
          error: 'Course not found',
          message: 'No course found with the provided ID'
        });
      }

      const isOwner = course.instructor.id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          error: 'Insufficient permissions',
          message: 'You can only unpublish your own courses'
        });
      }

      await course.unpublish();

      res.json({
        success: true,
        message: 'Course unpublished successfully',
        course: {
          id: course._id,
          title: course.title,
          status: course.status
        }
      });

    } catch (error) {
      console.error('Course unpublishing failed:', error);
      res.status(500).json({
        error: 'Course unpublishing failed',
        message: 'Unable to unpublish course'
      });
    }
  }

  public static async getMyCourses(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User not authenticated'
        });
      }

      const { page = 1, limit = 20, status } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = Math.min(parseInt(limit as string), 50);
      const skip = (pageNum - 1) * limitNum;

      let query: any = { 'instructor.id': req.user._id };
      if (status) query.status = status;

      const [courses, total] = await Promise.all([
        Course.find(query)
          .sort({ updatedAt: -1 })
          .limit(limitNum)
          .skip(skip),
        Course.countDocuments(query)
      ]);

      res.json({
        success: true,
        courses: courses.map(course => ({
          id: course._id,
          title: course.title,
          shortDescription: course.shortDescription,
          category: course.category,
          thumbnail: course.thumbnail,
          status: course.status,
          isPublished: course.isPublished,
          totalLessons: course.totalLessons,
          analytics: course.analytics,
          pricing: course.pricing,
          createdAt: course.createdAt,
          updatedAt: course.updatedAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalCourses: total,
          hasNextPage: pageNum * limitNum < total,
          hasPrevPage: pageNum > 1
        }
      });

    } catch (error) {
      console.error('Get my courses failed:', error);
      res.status(500).json({
        error: 'Courses retrieval failed',
        message: 'Unable to retrieve your courses'
      });
    }
  }
}

export default CourseController;