const admin = require('firebase-admin');
const serviceAccount = require('./word-app-2525d-firebase-adminsdk-fbsvc-6530ec11a9.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 관리자로 설정할 사용자 UID를 여기에 입력하세요.
const adminUid = 'qC0XAaGBaqPPb526HkurcMKziDQ2';

admin.auth().setCustomUserClaims(adminUid, { admin: true })
  .then(() => {
    console.log('관리자 클레임이 성공적으로 설정되었습니다.');
    process.exit(0);
  })
  .catch(error => {
    console.error('관리자 클레임 설정 오류:', error);
    process.exit(1);
  });