# AARAMBH AI SSL Certificate Setup Guide

This guide provides step-by-step instructions for setting up SSL certificates for the AARAMBH AI platform in production.

## 🔒 **SSL Certificate Options**

### **Option 1: Let's Encrypt (Recommended for Cost-Effective Solution)**

#### **Prerequisites:**
- Domain name pointed to your server
- Root or sudo access to the server
- Port 80 and 443 open

#### **Step 1: Install Certbot**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### **Step 2: Obtain SSL Certificate**
```bash
# For single domain
sudo certbot --nginx -d app.aarambh.ai

# For multiple domains
sudo certbot --nginx -d app.aarambh.ai -d api.aarambh.ai -d www.aarambh.ai
```

#### **Step 3: Verify Auto-Renewal**
```bash
# Test renewal
sudo certbot renew --dry-run

# Check renewal timer
sudo systemctl status certbot.timer
```

#### **Step 4: Configure Auto-Renewal**
```bash
# Edit crontab
sudo crontab -e

# Add this line to renew certificates twice daily
0 12 * * * /usr/bin/certbot renew --quiet
```

### **Option 2: Commercial SSL Certificate (Recommended for Enterprise)**

#### **Step 1: Generate Certificate Signing Request (CSR)**
```bash
# Generate private key
openssl genrsa -out aarambh.ai.key 2048

# Generate CSR
openssl req -new -key aarambh.ai.key -out aarambh.ai.csr

# Fill in the following information:
# Country Name: IN
# State: Your State
# City: Your City
# Organization Name: AARAMBH AI Technologies
# Organizational Unit: IT Department
# Common Name: aarambh.ai
# Email Address: admin@aarambh.ai
```

#### **Step 2: Purchase SSL Certificate**
- Submit CSR to certificate authority (DigiCert, Sectigo, etc.)
- Complete domain validation
- Download certificate files

#### **Step 3: Install Certificate**
```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/certs/aarambh.ai
sudo mkdir -p /etc/ssl/private/aarambh.ai

# Copy certificate files
sudo cp aarambh.ai.crt /etc/ssl/certs/aarambh.ai/
sudo cp aarambh.ai.key /etc/ssl/private/aarambh.ai/
sudo cp intermediate.crt /etc/ssl/certs/aarambh.ai/

# Set proper permissions
sudo chmod 644 /etc/ssl/certs/aarambh.ai/*.crt
sudo chmod 600 /etc/ssl/private/aarambh.ai/*.key
```

## 🌐 **Azure App Service SSL Setup**

### **Option 1: Azure-Managed Certificate (Free)**

#### **Step 1: Custom Domain Setup**
```bash
# Add custom domain in Azure Portal
az webapp config hostname add \
  --webapp-name aarambh-ai-frontend \
  --resource-group aarambh-ai-prod \
  --hostname app.aarambh.ai
```

#### **Step 2: Enable Managed Certificate**
```bash
# Create managed certificate
az webapp config ssl bind \
  --certificate-source AppServiceManaged \
  --hostname app.aarambh.ai \
  --name aarambh-ai-frontend \
  --resource-group aarambh-ai-prod
```

### **Option 2: Import Custom Certificate**

#### **Step 1: Upload Certificate**
```bash
# Upload certificate to Azure
az webapp config ssl upload \
  --certificate-file aarambh.ai.pfx \
  --certificate-password "your-pfx-password" \
  --name aarambh-ai-frontend \
  --resource-group aarambh-ai-prod
```

#### **Step 2: Bind Certificate**
```bash
# Bind certificate to domain
az webapp config ssl bind \
  --certificate-thumbprint "certificate-thumbprint" \
  --ssl-type SNI \
  --hostname app.aarambh.ai \
  --name aarambh-ai-frontend \
  --resource-group aarambh-ai-prod
```

## 🔧 **Nginx SSL Configuration**

### **Complete Nginx Configuration with SSL**

```nginx
# /etc/nginx/sites-available/aarambh.ai
server {
    listen 80;
    server_name app.aarambh.ai api.aarambh.ai www.aarambh.ai;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

# Frontend HTTPS Server
server {
    listen 443 ssl http2;
    server_name app.aarambh.ai;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/aarambh.ai/aarambh.ai.crt;
    ssl_certificate_key /etc/ssl/private/aarambh.ai/aarambh.ai.key;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    # Root directory
    root /usr/share/nginx/html;
    index index.html;
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
    }
    
    # Security
    location ~ /\. {
        deny all;
    }
}

# API Backend HTTPS Server
server {
    listen 443 ssl http2;
    server_name api.aarambh.ai;
    
    # SSL Configuration (same as above)
    ssl_certificate /etc/ssl/certs/aarambh.ai/aarambh.ai.crt;
    ssl_certificate_key /etc/ssl/private/aarambh.ai/aarambh.ai.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # Proxy to backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔐 **Security Best Practices**

### **1. SSL/TLS Configuration**
```bash
# Generate strong DH parameters
sudo openssl dhparam -out /etc/ssl/certs/dhparam.pem 2048

# Add to nginx configuration
ssl_dhparam /etc/ssl/certs/dhparam.pem;
```

### **2. Certificate Monitoring**
```bash
# Check certificate expiry
openssl x509 -in /etc/ssl/certs/aarambh.ai/aarambh.ai.crt -noout -dates

# Set up monitoring script
cat > /usr/local/bin/check-ssl.sh << 'EOF'
#!/bin/bash
CERT_FILE="/etc/ssl/certs/aarambh.ai/aarambh.ai.crt"
DAYS_UNTIL_EXPIRY=$(openssl x509 -in "$CERT_FILE" -noout -checkend $((30*24*60*60)) && echo "OK" || echo "EXPIRING")

if [ "$DAYS_UNTIL_EXPIRY" = "EXPIRING" ]; then
    echo "SSL certificate expiring soon!" | mail -s "SSL Certificate Alert" admin@aarambh.ai
fi
EOF

chmod +x /usr/local/bin/check-ssl.sh

# Add to crontab
echo "0 9 * * * /usr/local/bin/check-ssl.sh" | crontab -
```

### **3. HSTS Preload List**
```bash
# Submit your domain to HSTS preload list
# Visit: https://hstspreload.org/
# Enter domain: aarambh.ai
# Ensure these requirements are met:
# - Serve a valid certificate
# - Redirect from HTTP to HTTPS on the same host
# - Serve all subdomains over HTTPS
# - Serve an HSTS header on the base domain
```

## 🌍 **CDN SSL Configuration**

### **Cloudflare Setup**
```bash
# 1. Add domain to Cloudflare
# 2. Update nameservers at domain registrar
# 3. Set SSL/TLS encryption mode to "Full (strict)"
# 4. Enable "Always Use HTTPS"
# 5. Enable "HSTS"
# 6. Set minimum TLS version to 1.2
```

### **AWS CloudFront Setup**
```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "aarambh-ai-'$(date +%s)'",
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "aarambh-ai-origin",
          "DomainName": "app.aarambh.ai",
          "CustomOriginConfig": {
            "HTTPPort": 80,
            "HTTPSPort": 443,
            "OriginProtocolPolicy": "https-only"
          }
        }
      ]
    },
    "DefaultCacheBehavior": {
      "TargetOriginId": "aarambh-ai-origin",
      "ViewerProtocolPolicy": "redirect-to-https",
      "MinTTL": 0,
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {"Forward": "none"}
      }
    },
    "Comment": "AARAMBH AI CDN",
    "Enabled": true,
    "ViewerCertificate": {
      "ACMCertificateArn": "arn:aws:acm:us-east-1:account:certificate/certificate-id",
      "SSLSupportMethod": "sni-only"
    },
    "Aliases": {
      "Quantity": 1,
      "Items": ["app.aarambh.ai"]
    }
  }'
```

## 🚀 **Deployment Scripts**

### **SSL Setup Script**
```bash
#!/bin/bash
# ssl-setup.sh

set -e

DOMAIN="aarambh.ai"
EMAIL="admin@aarambh.ai"
WEBROOT="/usr/share/nginx/html"

echo "Setting up SSL for $DOMAIN..."

# Install certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Stop nginx temporarily
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly \
  --standalone \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d app.$DOMAIN \
  -d api.$DOMAIN \
  -d www.$DOMAIN

# Start nginx
sudo systemctl start nginx

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# Set up auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

echo "SSL setup completed successfully!"
echo "Certificates are stored in /etc/letsencrypt/live/$DOMAIN/"
```

### **Certificate Renewal Script**
```bash
#!/bin/bash
# renew-ssl.sh

set -e

echo "Renewing SSL certificates..."

# Renew certificates
sudo certbot renew --quiet

# Test nginx configuration
sudo nginx -t

# Reload nginx if config is valid
if [ $? -eq 0 ]; then
    sudo systemctl reload nginx
    echo "SSL certificates renewed and nginx reloaded successfully!"
else
    echo "Nginx configuration test failed!"
    exit 1
fi
```

## 📊 **SSL Monitoring and Alerts**

### **SSL Certificate Monitoring Service**
```bash
#!/bin/bash
# ssl-monitor.sh

DOMAINS=("app.aarambh.ai" "api.aarambh.ai" "www.aarambh.ai")
ALERT_EMAIL="admin@aarambh.ai"
ALERT_DAYS=30

for domain in "${DOMAINS[@]}"; do
    echo "Checking SSL certificate for $domain..."
    
    # Get certificate expiry date
    expiry_date=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | \
                  openssl x509 -noout -enddate | cut -d= -f2)
    
    # Convert to timestamp
    expiry_timestamp=$(date -d "$expiry_date" +%s)
    current_timestamp=$(date +%s)
    
    # Calculate days until expiry
    days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    if [ $days_until_expiry -lt $ALERT_DAYS ]; then
        echo "WARNING: SSL certificate for $domain expires in $days_until_expiry days!"
        echo "SSL certificate for $domain expires in $days_until_expiry days!" | \
            mail -s "SSL Certificate Expiry Alert - $domain" $ALERT_EMAIL
    else
        echo "SSL certificate for $domain is valid for $days_until_expiry days."
    fi
done
```

## 🎯 **Next Steps**

1. **Choose SSL Option**: Select between Let's Encrypt (free) or commercial certificate
2. **Configure DNS**: Point your domain to the server IP
3. **Install Certificate**: Follow the appropriate setup guide above
4. **Update Application**: Ensure all URLs use HTTPS
5. **Test Configuration**: Verify SSL setup using online tools
6. **Monitor Certificates**: Set up automated monitoring and renewal

## 🔗 **Useful Resources**

- [SSL Labs Server Test](https://www.ssllabs.com/ssltest/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [HSTS Preload List](https://hstspreload.org/)

---

*This guide provides comprehensive SSL setup for the AARAMBH AI platform. Choose the option that best fits your requirements and budget.*