const net = require('net');

async function testPort(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 5000;
    
    socket.setTimeout(timeout);
    
    socket.on('connect', () => {
      console.log(`✅ Port ${port} is open`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Port ${port} timeout`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Port ${port} error: ${err.code}`);
      resolve(false);
    });
    
    socket.connect(port, host);
  });
}

async function testGmailPorts() {
  console.log('🔍 Testing Gmail SMTP ports...\n');
  
  const ports = [25, 587, 465];
  const host = 'smtp.gmail.com';
  
  for (const port of ports) {
    await testPort(host, port);
  }
  
  console.log('\n💡 If all ports are blocked:');
  console.log('1. Check Windows Firewall settings');
  console.log('2. Check antivirus software');
  console.log('3. Check router/ISP blocking');
  console.log('4. Try using a VPN');
  console.log('5. Use a different email service (SendGrid, Mailgun)');
}

testGmailPorts();
