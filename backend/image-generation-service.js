const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

// Image generation providers
const PROVIDERS = {
  REPLICATE: 'replicate',
  OPENAI_DALLE: 'openai_dalle',
  HUGGINGFACE: 'huggingface',
  STABILITY_AI: 'stability_ai'
};

class ImageGenerationService {
  constructor() {
    this.providers = this.initializeProviders();
    this.cache = new Map(); // Simple in-memory cache
    this.cacheDir = path.join(__dirname, 'image_cache');
    this.ensureCacheDirectory();
  }

  initializeProviders() {
    const providers = {};
    
    // Check available API keys and configure providers
    if (process.env.REPLICATE_API_TOKEN) {
      providers[PROVIDERS.REPLICATE] = {
        available: true,
        priority: 1,
        name: 'Replicate (SDXL)'
      };
    }
    
    if (process.env.OPENAI_API_KEY) {
      providers[PROVIDERS.OPENAI_DALLE] = {
        available: true,
        priority: 2,
        name: 'OpenAI DALL-E'
      };
    }
    
    if (process.env.HUGGINGFACE_API_KEY) {
      providers[PROVIDERS.HUGGINGFACE] = {
        available: true,
        priority: 3,
        name: 'Hugging Face'
      };
    }
    
    if (process.env.STABILITY_API_KEY) {
      providers[PROVIDERS.STABILITY_AI] = {
        available: true,
        priority: 4,
        name: 'Stability AI'
      };
    }
    
    console.log('🎨 Available Image Generation Providers:');
    Object.entries(providers).forEach(([key, provider]) => {
      console.log(`   ✅ ${provider.name} (Priority: ${provider.priority})`);
    });
    
    if (Object.keys(providers).length === 0) {
      console.log('   ⚠️  No image generation APIs configured');
      console.log('   📝 Add API keys to .env file to enable image generation');
    }
    
    return providers;
  }

  ensureCacheDirectory() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
      console.log('📁 Created image cache directory');
    }
  }

  // Generate cache key for image prompts
  generateCacheKey(prompt, style = 'educational') {
    const hash = crypto.createHash('md5');
    hash.update(`${prompt}_${style}`);
    return hash.digest('hex');
  }

  // Check if image exists in cache
  getFromCache(cacheKey) {
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
    if (fs.existsSync(cachePath)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
        const age = Date.now() - cached.timestamp;
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        
        if (age < maxAge && fs.existsSync(cached.imagePath)) {
          console.log('📦 Using cached image for prompt');
          return cached;
        }
      } catch (error) {
        console.warn('Cache read error:', error);
      }
    }
    return null;
  }

  // Save image to cache
  saveToCache(cacheKey, imageData, metadata) {
    try {
      const imagePath = path.join(this.cacheDir, `${cacheKey}.png`);
      const metaPath = path.join(this.cacheDir, `${cacheKey}.json`);
      
      // Save image file
      fs.writeFileSync(imagePath, imageData);
      
      // Save metadata
      const cacheData = {
        ...metadata,
        imagePath,
        timestamp: Date.now(),
        cacheKey
      };
      fs.writeFileSync(metaPath, JSON.stringify(cacheData, null, 2));
      
      console.log('💾 Saved image to cache');
      return { ...cacheData, imageUrl: `/api/images/${cacheKey}.png` };
    } catch (error) {
      console.error('Cache save error:', error);
      return null;
    }
  }

  // Enhanced prompt generation for better quality educational images
  enhanceEducationalPrompt(prompt, style = 'educational', metadata = {}) {
    const { title = '', description = '', subject = '' } = metadata;
    
    const baseEnhancement = {
      educational: `Professional educational illustration: ${prompt}. 
        High-quality scientific diagram style, clean vector art aesthetic, 
        bright educational colors (blue, green, orange), clear labels and annotations, 
        suitable for textbooks and learning materials, detailed and informative, 
        professional graphic design, crisp lines, scientific accuracy, 
        educational infographic style, modern clean design, 4K resolution`,
        
      scientific: `Highly detailed scientific diagram: ${prompt}. 
        Academic research quality, technical precision, detailed annotations, 
        scientific journal style, professional medical/scientific illustration, 
        precise anatomical or technical details, neutral academic colors, 
        publication-ready quality, ultra-detailed, scientifically accurate, 
        research-grade visualization, 8K resolution`,
        
      infographic: `Modern educational infographic: ${prompt}. 
        Data visualization style, clean modern layout, professional typography, 
        colorful charts and graphs, icon-based design elements, 
        corporate presentation style, information design, 
        contemporary color palette, engaging visual hierarchy, 
        business presentation quality, 4K resolution`,
        
      interactive: `Interactive educational visualization: ${prompt}. 
        Game-like educational art style, engaging and colorful, 
        student-friendly design, approachable illustrations, 
        cartoon-educational hybrid style, vibrant colors, 
        interactive media design, engaging learning materials, 
        high-quality digital art, appealing to students, 4K resolution`,
        
      detailed: `Comprehensive detailed illustration: ${prompt}. 
        Multiple perspectives and views, cross-sectional diagrams, 
        step-by-step process visualization, extensive labeling, 
        educational poster style, museum display quality, 
        comprehensive educational resource, detailed explanatory graphics, 
        professional educational publisher quality, ultra-high detail, 8K resolution`
    };
    
    let enhancedPrompt = baseEnhancement[style] || baseEnhancement.educational;
    
    // Add subject-specific enhancements
    if (subject) {
      const subjectEnhancements = {
        physics: ', physics laboratory style, scientific equipment, mathematical formulas visible, electromagnetic field visualizations',
        chemistry: ', molecular structure diagrams, chemical reaction pathways, laboratory glassware, periodic table elements',
        biology: ', anatomical accuracy, biological processes, cellular structures, organism diagrams, life science illustrations',
        mathematics: ', geometric precision, mathematical graphs and charts, equation visualizations, mathematical proofs layout',
        history: ', historical timeline style, period-appropriate imagery, documentary illustration style, archival quality',
        geography: ', cartographic style, topographical details, satellite imagery aesthetic, geographic information systems style'
      };
      
      if (subjectEnhancements[subject.toLowerCase()]) {
        enhancedPrompt += subjectEnhancements[subject.toLowerCase()];
      }
    }
    
    // Add quality and format specifications
    enhancedPrompt += ', no text overlays, no watermarks, clean background, educational use, professional quality, publication ready';
    
    return enhancedPrompt;
  }

  // Generate educational image using Replicate (SDXL)
  async generateWithReplicate(prompt, style = 'educational', metadata = {}) {
    const enhancedPrompt = this.enhanceEducationalPrompt(prompt, style, metadata);
    
    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc", // Latest SDXL model for high quality
          input: {
            prompt: enhancedPrompt,
            negative_prompt: "blurry, low quality, distorted, inappropriate, violent, dark, scary, photographic, realistic photo, watermark, signature, text overlay, poor anatomy, deformed, ugly, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed face, bad anatomy, bad proportions, duplicate, cropped, low-res, worst quality, jpeg artifacts, text, logo, watermark, blurred, out of focus",
            width: 1344,
            height: 768,
            num_outputs: 1,
            scheduler: "DPMSolverMultistep",
            guidance_scale: 12,
            num_inference_steps: 50,
            refine: "expert_ensemble_refiner",
            high_noise_frac: 0.8,
            apply_watermark: false
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.status}`);
      }

      const prediction = await response.json();
      
      // Wait for completion
      let result = await this.waitForCompletion(prediction.id, 'replicate');
      
      if (result.status === 'succeeded' && result.output && result.output[0]) {
        const imageUrl = result.output[0];
        const imageData = await this.downloadImage(imageUrl);
        return { imageData, provider: 'Replicate SDXL', prompt: enhancedPrompt };
      }
      
      throw new Error('Replicate generation failed');
    } catch (error) {
      console.error('Replicate generation error:', error);
      throw error;
    }
  }

  // Generate image using OpenAI DALL-E
  async generateWithOpenAI(prompt, style = 'educational', metadata = {}) {
    const enhancedPrompt = this.enhanceEducationalPrompt(prompt, style, metadata);
    
    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: enhancedPrompt.slice(0, 4000), // DALL-E 3 has a 4000 character limit
          n: 1,
          size: "1792x1024", // Higher resolution for better quality
          quality: "hd", // HD quality for crisp educational images
          style: "natural" // More realistic and detailed style
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message}`);
      }

      const result = await response.json();
      
      if (result.data && result.data[0] && result.data[0].url) {
        const imageUrl = result.data[0].url;
        const imageData = await this.downloadImage(imageUrl);
        return { imageData, provider: 'OpenAI DALL-E 3', prompt: enhancedPrompt };
      }
      
      throw new Error('OpenAI generation failed');
    } catch (error) {
      console.error('OpenAI generation error:', error);
      throw error;
    }
  }

  // Generate image using Hugging Face
  async generateWithHuggingFace(prompt, style = 'educational') {
    const enhancedPrompt = this.enhanceEducationalPrompt(prompt, style);
    
    try {
      const response = await fetch(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: enhancedPrompt,
            parameters: {
              negative_prompt: "blurry, low quality, distorted, inappropriate",
              num_inference_steps: 25,
              guidance_scale: 7.5
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.status}`);
      }

      const imageData = await response.arrayBuffer();
      return { 
        imageData: Buffer.from(imageData), 
        provider: 'Hugging Face SDXL', 
        prompt: enhancedPrompt 
      };
    } catch (error) {
      console.error('Hugging Face generation error:', error);
      throw error;
    }
  }

  // Wait for async generation completion (Replicate)
  async waitForCompletion(predictionId, provider, maxWait = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWait) {
      try {
        let response;
        
        if (provider === 'replicate') {
          response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
              'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
            }
          });
        }
        
        if (!response.ok) {
          throw new Error(`Status check failed: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status === 'succeeded' || result.status === 'failed') {
          return result;
        }
        
        // Wait before next check
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Status check error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    throw new Error('Generation timeout');
  }

  // Download image from URL
  async downloadImage(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Image download error:', error);
      throw error;
    }
  }

  // Enhance prompt for educational content
  enhanceEducationalPrompt(originalPrompt, style = 'educational') {
    const stylePrompts = {
      educational: "educational illustration, clean design, bright colors, clear labels, suitable for students, scientific diagram style, informative",
      scientific: "scientific illustration, technical diagram, precise details, academic style, research quality",
      kids: "colorful cartoon style, friendly, simple shapes, bright colors, fun educational content for children",
      infographic: "infographic style, modern design, icons, charts, visual data representation, clean layout"
    };

    const baseEnhancement = stylePrompts[style] || stylePrompts.educational;
    
    return `${originalPrompt}, ${baseEnhancement}, high quality, professional, digital art, vector style`;
  }

  // Main generation method with fallbacks
  async generateEducationalImage(prompt, options = {}) {
    const { style = 'educational', useCache = true } = options;
    
    console.log(`🎨 Generating educational image for: "${prompt}"`);
    
    // Check cache first
    if (useCache) {
      const cacheKey = this.generateCacheKey(prompt, style);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return {
          success: true,
          imageUrl: cached.imageUrl,
          provider: `${cached.provider} (cached)`,
          prompt: cached.prompt,
          cached: true
        };
      }
    }

    // Try providers in priority order
    const sortedProviders = Object.entries(this.providers)
      .filter(([_, config]) => config.available)
      .sort((a, b) => a[1].priority - b[1].priority);

    for (const [providerKey, config] of sortedProviders) {
      try {
        console.log(`🔄 Trying ${config.name}...`);
        
        let result;
        switch (providerKey) {
          case PROVIDERS.REPLICATE:
            result = await this.generateWithReplicate(prompt, style);
            break;
          case PROVIDERS.OPENAI_DALLE:
            result = await this.generateWithOpenAI(prompt, style);
            break;
          case PROVIDERS.HUGGINGFACE:
            result = await this.generateWithHuggingFace(prompt, style);
            break;
          default:
            continue;
        }

        if (result && result.imageData) {
          // Save to cache
          const cacheKey = this.generateCacheKey(prompt, style);
          const cached = this.saveToCache(cacheKey, result.imageData, {
            provider: result.provider,
            prompt: result.prompt,
            style,
            originalPrompt: prompt
          });

          if (cached) {
            console.log(`✅ Image generated successfully with ${result.provider}`);
            return {
              success: true,
              imageUrl: cached.imageUrl,
              provider: result.provider,
              prompt: result.prompt,
              cached: false
            };
          }
        }
      } catch (error) {
        console.warn(`❌ ${config.name} failed:`, error.message);
        continue;
      }
    }

    // All providers failed
    console.error('❌ All image generation providers failed');
    return {
      success: false,
      error: 'All image generation services are currently unavailable',
      provider: 'none'
    };
  }

  // Get available providers info
  getProvidersInfo() {
    return {
      available: Object.keys(this.providers).length,
      providers: Object.entries(this.providers).map(([key, config]) => ({
        key,
        name: config.name,
        priority: config.priority,
        available: config.available
      }))
    };
  }

  // Clean old cache entries
  cleanCache(maxAge = 7 * 24 * 60 * 60 * 1000) {
    try {
      const files = fs.readdirSync(this.cacheDir);
      let cleaned = 0;
      
      files.forEach(file => {
        const filePath = path.join(this.cacheDir, file);
        const stats = fs.statSync(filePath);
        const age = Date.now() - stats.mtime.getTime();
        
        if (age > maxAge) {
          fs.unlinkSync(filePath);
          cleaned++;
        }
      });
      
      if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} old cache files`);
      }
    } catch (error) {
      console.error('Cache cleaning error:', error);
    }
  }
}

module.exports = { ImageGenerationService, PROVIDERS };