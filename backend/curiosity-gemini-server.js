const http = require('http');
const fs = require('fs');
const path = require('path');
const { ImageGenerationService } = require('./image-generation-service');

// Load environment variables manually
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

const PORT = process.env.PORT || 5001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Check for Gemini API key
const hasGemini = !!GEMINI_API_KEY;

console.log('🔑 Gemini API Key Status:', hasGemini ? '✅ Found' : '❌ Missing');

if (!hasGemini) {
  console.warn('⚠️  Gemini API key not found. Add GEMINI_API_KEY to your .env file');
  console.warn('📝 Get your API key from: https://makersuite.google.com/app/apikey');
}

// Gemini API interaction function
async function callGeminiAPI(prompt, isJSONMode = false) {
  if (!hasGemini) {
    throw new Error('Gemini API key not configured');
  }

  // Enhanced prompt for extensive educational content
  const enhancedPrompt = `You are SARAS, an advanced AI tutor for Indian students. You specialize in creating comprehensive, engaging educational explanations with extensive detail and depth.

User Query: "${prompt}"

${isJSONMode ? `
IMPORTANT: Respond with ONLY a valid JSON object in this exact format:
{
  "title": "A clear, descriptive title for the topic",
  "summary": "A comprehensive 4-5 sentence explanation that provides deep understanding",
  "keyPoints": ["6-8 detailed bullet points that thoroughly explain the key concepts with specifics"],
  "realWorldExample": "A detailed, practical example from daily life in India that demonstrates this concept with specific scenarios",
  "difficulty": "beginner|intermediate|advanced",
  "subject": "relevant subject area",
  "connections": ["4-5 related topics the student might want to explore next"],
  "detailedExplanation": "A comprehensive 200-300 word detailed explanation covering mechanisms, processes, and scientific principles",
  "practicalApplications": ["5-6 specific real-world applications with Indian context"],
  "historicalContext": "Brief history or discovery background of this concept",
  "currentResearch": "Latest developments or ongoing research in this field",
  "mathematicalConcepts": "Any mathematical principles or formulas involved (if applicable)",
  "experimentalEvidence": "Key experiments or evidence that supports this concept",
  "misconceptions": ["2-3 common misconceptions about this topic"],
  "studyTips": ["3-4 effective ways to remember and understand this concept"],
  "careerConnections": ["3-4 career fields where this knowledge is applied"],
  "indianContext": "How this concept specifically relates to Indian context, culture, or examples",
  "visualizationSuggestions": ["3-4 specific suggestions for visual representations or diagrams"],
  "interactiveElements": ["2-3 hands-on activities or experiments students can try"],
  "assessmentQuestions": ["3-4 thought-provoking questions to test understanding"],
  "furtherReading": ["2-3 recommended resources for deeper learning"],
  "difficulty_explanation": "Why this topic is classified at this difficulty level"
}

Make sure the content is:
- Extensively detailed and comprehensive
- Scientifically accurate with latest information
- Appropriate for Indian educational context
- Uses multiple examples relevant to Indian culture and daily life
- Includes practical applications and career connections
- Provides study strategies and learning tips
- Addresses common misconceptions
- Encourages hands-on learning and experimentation

Do not include any text before or after the JSON object.` : `
Provide an extensively comprehensive explanation that includes:
1. A detailed introduction to the concept with background
2. The complete mechanisms, principles, and processes involved
3. Multiple real-world applications, especially relevant to India
4. Historical context and discovery background
5. Current research and recent developments
6. Mathematical or scientific principles involved
7. Common misconceptions and how to avoid them
8. Practical study tips and memory techniques
9. Career applications and professional relevance
10. Interactive experiments or activities
11. Visual representation suggestions
12. Assessment questions for self-testing

Make your explanation extensively detailed, scientifically accurate, and educationally comprehensive for serious learners.`}`;

  const requestBody = {
    contents: [{
      parts: [{
        text: enhancedPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.8,
      topK: 50,
      topP: 0.95,
      maxOutputTokens: 4096,
      candidateCount: 1,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response structure from Gemini API');
    }

    const content = data.candidates[0].content.parts[0].text;
    
    if (isJSONMode) {
      // Validate and parse JSON response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        // Fallback: create structured response from text
        return createFallbackStructuredResponse(prompt, content);
      }
    }
    
    return content;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

// Fallback function to create structured response from text
function createFallbackStructuredResponse(query, textContent) {
  const lines = textContent.split('\n').filter(line => line.trim());
  
  return {
    title: `Understanding: ${query}`,
    summary: textContent.substring(0, 300) + (textContent.length > 300 ? '...' : ''),
    keyPoints: lines.slice(0, 4).map(line => line.trim().replace(/^[-•*]\s*/, '')),
    realWorldExample: `Think of ${query.toLowerCase()} as something you encounter in daily life - it's more relevant than you might think!`,
    difficulty: "intermediate",
    subject: "general",
    connections: [`Related concepts to ${query}`, "Further exploration topics", "Advanced applications"]
  };
}

// Teacher Agent class for educational content generation
class TeacherAgent {
  async generateExplanation(query, options = {}) {
    const { level = 'intermediate', subject = 'general', jsonMode = true } = options;
    
    try {
      console.log(`🎓 Teacher Agent generating explanation for: "${query}"`);
      console.log(`📚 Level: ${level}, Subject: ${subject}, JSON Mode: ${jsonMode}`);
      
      if (hasGemini) {
        const result = await callGeminiAPI(query, jsonMode);
        console.log('✅ Gemini API response received');
        return {
          success: true,
          data: {
            id: `teacher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            agentType: 'teacher',
            provider: 'gemini',
            content: jsonMode ? JSON.stringify(result) : result,
            metadata: { level, subject, jsonMode, query },
            timestamp: new Date().toISOString()
          }
        };
      } else {
        console.log('⚠️  Using fallback response (no Gemini API key)');
        return this.getFallbackResponse(query, { level, subject, jsonMode });
      }
    } catch (error) {
      console.error('❌ Teacher Agent error:', error);
      return this.getFallbackResponse(query, { level, subject, jsonMode });
    }
  }

  getFallbackResponse(query, options) {
    const { level, subject, jsonMode } = options;
    
    const fallbackResponses = {
      'quantum entanglement': {
        title: "Quantum Entanglement",
        summary: "Quantum entanglement is a phenomenon where particles become connected and instantly affect each other, regardless of the distance separating them. Einstein called it 'spooky action at a distance.'",
        keyPoints: [
          "Two particles become quantum mechanically linked",
          "Measuring one particle instantly affects the other",
          "This happens regardless of distance between particles",
          "Forms the basis for quantum computing and cryptography"
        ],
        realWorldExample: "Imagine two magical coins - when you flip one to heads in Mumbai, the other automatically becomes tails in Delhi instantly. This is similar to how entangled particles behave.",
        difficulty: "intermediate",
        subject: "physics",
        connections: ["Quantum Computing", "Quantum Cryptography", "Bell's Theorem"]
      },
      'black holes': {
        title: "Black Holes",
        summary: "Black holes are regions in space where gravity is so strong that nothing, not even light, can escape once it crosses the event horizon. They form when massive stars collapse.",
        keyPoints: [
          "Formed from collapsed massive stars",
          "Gravitational pull so strong light cannot escape",
          "Have an event horizon - point of no return",
          "Can bend time and space around them"
        ],
        realWorldExample: "Think of a black hole like a cosmic drain in your sink - everything gets pulled in and nothing can come back out, just like water going down the drain.",
        difficulty: "beginner",
        subject: "astronomy",
        connections: ["General Relativity", "Event Horizon", "Hawking Radiation"]
      }
    };

    const queryLower = query.toLowerCase();
    let response = fallbackResponses[queryLower] || {
      title: `Understanding: ${query}`,
      summary: `This is a comprehensive explanation about ${query}. The concept involves multiple interconnected principles that are fundamental to understanding this topic.`,
      keyPoints: [
        `${query} is an important concept in its field`,
        "Understanding requires grasping the underlying principles",
        "Real-world applications make this concept practical",
        "This knowledge connects to many other related topics"
      ],
      realWorldExample: `You can see examples of ${query} in everyday life around you. It's more common and relevant than you might initially think.`,
      difficulty: level,
      subject: subject,
      connections: ["Related Topic 1", "Related Topic 2", "Advanced Applications"]
    };

    const content = jsonMode ? JSON.stringify(response) : 
      `${response.title}\n\n${response.summary}\n\nKey Points:\n${response.keyPoints.map(point => `• ${point}`).join('\n')}\n\nReal-world Example:\n${response.realWorldExample}`;

    return {
      success: true,
      data: {
        id: `teacher_fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        agentType: 'teacher',
        provider: 'fallback',
        content,
        metadata: { level, subject, jsonMode, query },
        timestamp: new Date().toISOString()
      }
    };
  }
}

const teacherAgent = new TeacherAgent();
const imageService = new ImageGenerationService();

// HTTP Server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  
  // Parse JSON body for POST requests
  const parseBody = () => {
    return new Promise((resolve) => {
      if (req.method !== 'POST') {
        resolve({});
        return;
      }
      
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          console.error('Failed to parse request body:', e);
          resolve({});
        }
      });
    });
  };
  
  const sendJSON = (data, statusCode = 200) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  };
  
  // Routes
  if (pathname === '/api/ai/health' && req.method === 'GET') {
    sendJSON({
      success: true,
      data: {
        status: hasGemini ? 'healthy' : 'degraded',
        services: {
          gemini: hasGemini,
          teacherAgent: true
        },
        timestamp: new Date().toISOString(),
        server: 'curiosity-gemini-server'
      }
    });
    return;
  }
  
  if (pathname === '/api/ai/agents' && req.method === 'GET') {
    sendJSON({
      success: true,
      data: {
        teacher: { 
          available: true, 
          provider: hasGemini ? 'gemini' : 'fallback',
          capabilities: ['explanation', 'structured_content', 'educational_context']
        },
        imageGenerator: {
          available: true,
          providers: imageService.getProvidersInfo(),
          capabilities: ['educational_illustrations', 'scientific_diagrams', 'infographics']
        }
      }
    });
    return;
  }
  
  // Enhanced tutor endpoint with Gemini integration
  if (pathname === '/api/ai/tutor' && req.method === 'POST') {
    parseBody().then(async (body) => {
      console.log('📚 AI Tutor request:', body);
      
      const { prompt, subject = 'general', level = 'intermediate', jsonMode = false } = body;
      
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        sendJSON({
          success: false,
          error: 'Missing or invalid prompt',
          timestamp: new Date().toISOString()
        }, 400);
        return;
      }
      
      try {
        const result = await teacherAgent.generateExplanation(prompt, {
          level,
          subject,
          jsonMode
        });
        
        sendJSON(result);
      } catch (error) {
        console.error('Error in tutor endpoint:', error);
        sendJSON({
          success: false,
          error: 'Internal server error',
          message: error.message,
          timestamp: new Date().toISOString()
        }, 500);
      }
    });
    return;
  }
  
  // Content generation endpoint
  if (pathname === '/api/ai/content' && req.method === 'POST') {
    parseBody().then(async (body) => {
      console.log('🎨 Content generation request:', body);
      
      const { prompt, contentType = 'explanation', subject = 'general', level = 'intermediate' } = body;
      
      try {
        const result = await teacherAgent.generateExplanation(prompt, {
          level,
          subject,
          jsonMode: true // Always use JSON mode for content generation
        });
        
        sendJSON(result);
      } catch (error) {
        console.error('Error in content endpoint:', error);
        sendJSON({
          success: false,
          error: 'Content generation failed',
          message: error.message,
          timestamp: new Date().toISOString()
        }, 500);
      }
    });
    return;
  }
  
  // Image generation endpoint
  if (pathname === '/api/ai/generate-image' && req.method === 'POST') {
    parseBody().then(async (body) => {
      console.log('🎨 Image generation request:', body);
      
      const { prompt, style = 'educational', title, description } = body;
      
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        sendJSON({
          success: false,
          error: 'Missing or invalid prompt',
          timestamp: new Date().toISOString()
        }, 400);
        return;
      }
      
      try {
        // Enhance prompt with title and description if provided
        let enhancedPrompt = prompt;
        if (title) {
          enhancedPrompt = `Educational illustration for "${title}": ${prompt}`;
        }
        if (description) {
          enhancedPrompt += `. Context: ${description}`;
        }
        
        const result = await imageService.generateEducationalImage(enhancedPrompt, {
          style,
          useCache: true
        });
        
        if (result.success) {
          sendJSON({
            success: true,
            data: {
              id: `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              imageUrl: result.imageUrl,
              provider: result.provider,
              prompt: result.prompt,
              style,
              cached: result.cached,
              timestamp: new Date().toISOString()
            }
          });
        } else {
          sendJSON({
            success: false,
            error: result.error || 'Image generation failed',
            provider: result.provider,
            timestamp: new Date().toISOString()
          }, 500);
        }
      } catch (error) {
        console.error('Error in image generation endpoint:', error);
        sendJSON({
          success: false,
          error: 'Image generation service error',
          message: error.message,
          timestamp: new Date().toISOString()
        }, 500);
      }
    });
    return;
  }

  // Serve cached images
  if (pathname.startsWith('/api/images/') && req.method === 'GET') {
    try {
      const filename = pathname.replace('/api/images/', '');
      const imagePath = path.join(__dirname, 'image_cache', filename);
      
      if (fs.existsSync(imagePath) && filename.endsWith('.png')) {
        const imageData = fs.readFileSync(imagePath);
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400' // 24 hours
        });
        res.end(imageData);
        return;
      }
      
      // Image not found
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Image not found',
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error serving image:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Failed to serve image',
        timestamp: new Date().toISOString()
      }));
    }
    return;
  }

  // Generic AI request endpoint
  if (pathname === '/api/ai/request' && req.method === 'POST') {
    parseBody().then(async (body) => {
      console.log('🤖 Generic AI request:', body);
      
      const { prompt, agentType = 'teacher', metadata = {} } = body;
      
      if (agentType === 'teacher') {
        try {
          const result = await teacherAgent.generateExplanation(prompt, {
            ...metadata,
            jsonMode: metadata.jsonMode || false
          });
          
          sendJSON(result);
        } catch (error) {
          console.error('Error in generic request:', error);
          sendJSON({
            success: false,
            error: 'Request processing failed',
            message: error.message,
            timestamp: new Date().toISOString()
          }, 500);
        }
      } else {
        sendJSON({
          success: false,
          error: 'Unsupported agent type',
          message: `Agent type '${agentType}' is not supported by this server`,
          timestamp: new Date().toISOString()
        }, 400);
      }
    });
    return;
  }
  
  // 404 for unmatched routes
  sendJSON({
    error: 'Route not found',
    message: `Cannot ${req.method} ${pathname}`,
    availableEndpoints: [
      'GET /api/ai/health',
      'GET /api/ai/agents', 
      'POST /api/ai/tutor',
      'POST /api/ai/content',
      'POST /api/ai/generate-image',
      'GET /api/images/{filename}',
      'POST /api/ai/request'
    ],
    timestamp: new Date().toISOString()
  }, 404);
});

server.listen(PORT, () => {
  console.log(`🚀 Curiosity Gemini Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/ai/health`);
  console.log(`🎓 Teacher Agent: http://localhost:${PORT}/api/ai/tutor`);
  console.log(`🌐 CORS enabled for: http://localhost:3000`);
  
  if (hasGemini) {
    console.log(`✨ Gemini AI integration: ACTIVE`);
  } else {
    console.log(`⚠️  Gemini AI integration: FALLBACK MODE`);
    console.log(`📝 Add GEMINI_API_KEY to .env file to enable AI features`);
  }
  
  console.log(`📡 Server ready for Curiosity Platform requests!`);
});