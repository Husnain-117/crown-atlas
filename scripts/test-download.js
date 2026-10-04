const https = require('https');
const fs = require('fs');

const url = "https://source.unsplash.com/1920x1080/?san%20jose%20california%20silicon%20valley";
const filepath = "test-image.jpg";

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      console.log('Status Code:', response.statusCode);
      console.log('Headers:', response.headers);

      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${filepath}`);
          resolve();
        });
      } else if (response.statusCode === 301 || response.statusCode === 302) {
        console.log('Redirecting to:', response.headers.location);
        downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
      } else {
        file.close();
        fs.unlinkSync(filepath);
        reject(new Error(`Failed to download: ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      reject(err);
    });
  });
}

downloadImage(url, filepath).catch(console.error);


