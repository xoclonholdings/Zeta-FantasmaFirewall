module.exports = {
  apps: [{
    name: 'fantasma-firewall',
    script: 'dist/index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    log_file: '/var/log/fantasma-firewall/combined.log',
    out_file: '/var/log/fantasma-firewall/out.log',
    error_file: '/var/log/fantasma-firewall/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Auto-restart on crashes
    max_restarts: 10,
    min_uptime: '10s',
    
    // Memory monitoring
    max_memory_restart: '1G',
    
    // Health monitoring
    health_check_grace_period: 10000,
    health_check_fatal_exceptions: true,
    
    // Performance optimization
    node_args: '--max-old-space-size=4096',
    
    // Environment variables
    env_file: '.env'
  }]
};