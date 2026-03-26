module.exports = {
  apps: [{
    name: 'hvacops',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/var/www/hvacops',
    instances: 'max',           // Use all CPU cores (cluster mode)
    exec_mode: 'cluster',       // Enable clustering for load balancing
    max_memory_restart: '1G',   // Restart if memory exceeds 1GB
    
    // Environment variables
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Logging
    log_file: '/var/log/hvacops/combined.log',
    out_file: '/var/log/hvacops/out.log',
    error_file: '/var/log/hvacops/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart settings
    min_uptime: '10s',
    max_restarts: 5,
    restart_delay: 3000,
    
    // Monitoring
    monitoring: false,
    
    // Advanced settings
    merge_logs: true,
    kill_timeout: 5000,
    listen_timeout: 10000,
    
    // Watch mode (disabled for production)
    watch: false,
    ignore_watch: ['node_modules', '.git', 'logs'],
    
    // Source map support
    source_map_support: false
  }],
  
  deploy: {
    production: {
      user: 'ec2-user',
      host: process.env.DEPLOY_HOST,
      ref: 'origin/main',
      repo: process.env.DEPLOY_REPO,
      path: '/var/www/hvacops',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
