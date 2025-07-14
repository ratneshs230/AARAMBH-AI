import { IUser } from '../models/User';
import { ICourse } from '../models/Course';

export function getUserFullName(user: IUser): string {
  return `${user.firstName} ${user.lastName}`;
}

export function getUserAge(user: IUser): number | null {
  if (!user.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(user.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function getCourseCompletionRate(course: ICourse): number {
  if (course.analytics.enrollmentCount === 0) return 0;
  return (course.analytics.completionCount / course.analytics.enrollmentCount) * 100;
}

export function getCourseEffectivePrice(course: ICourse): number {
  if (course.pricing.type === 'free') return 0;
  if (course.pricing.discountPrice && course.pricing.discountEndDate && new Date() <= course.pricing.discountEndDate) {
    return course.pricing.discountPrice;
  }
  return course.pricing.amount || 0;
}

export function isUserSubscriptionActive(user: IUser): boolean {
  if (user.subscriptionType === 'free') return true;
  if (!user.subscriptionEndDate) return false;
  return new Date() <= user.subscriptionEndDate;
}

export async function updateUserLastActive(user: IUser): Promise<IUser> {
  user.analytics.lastActiveDate = new Date();
  user.analytics.loginCount += 1;
  return user.save();
}

export async function updateUserStreakDays(user: IUser): Promise<IUser> {
  const today = new Date();
  const lastActive = new Date(user.analytics.lastActiveDate);
  const diffTime = Math.abs(today.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    user.analytics.streakDays += 1;
  } else if (diffDays > 1) {
    user.analytics.streakDays = 1;
  }
  
  user.analytics.lastActiveDate = today;
  return user.save();
}

export async function incrementCourseView(course: ICourse): Promise<ICourse> {
  course.analytics.viewCount += 1;
  return course.save();
}

export async function publishCourse(course: ICourse): Promise<ICourse> {
  course.status = 'published';
  course.isPublished = true;
  course.publishedAt = new Date();
  return course.save();
}

export async function unpublishCourse(course: ICourse): Promise<ICourse> {
  course.status = 'draft';
  course.isPublished = false;
  return course.save();
}