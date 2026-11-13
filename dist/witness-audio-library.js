(function(root){'use strict';
const sounds=Object.fromEntries(['harbor','wind','fire','q01-quiet-score','wood','rope','paper','cloth','step-stone','step-wood','q01-bell'].map(id=>[id,{files:['assets/audio/q01/'+id+'.wav']}]));
const file='assets/audio/q01/natan-night.mp3';
const voices=[
 ['Con ngồi đi. Cha con hay để mái chèo ở phía ấy.',.14,3.15],
 ['Mấy hôm nay chú cứ quay sang hỏi ông ấy một câu. Hỏi xong mới nhớ ra.',3.81,8.20],
 ['Chú cũng chưa quen.',9.00,10.16],
 ['Nếu con muốn nói, chú nghe.',10.39,11.95],
 ['Đèn còn dầu. Con cứ ngồi.',12.46,14.24]
].map(([text,start,end])=>({person:'natan',text,file,start,end}));
const library={version:2,sounds,voices};root.WitnessAudioLibrary=library;if(typeof module!=='undefined')module.exports=library;
})(globalThis);
