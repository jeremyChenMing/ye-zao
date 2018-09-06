const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const formatTimeCH = (create_time) => {
  let str = '';
  const nowTime = new Date().getTime();
  const time = new Date(create_time).getTime(); //2018-08-02 17:42:42
  const diff = nowTime - time; //617820202

  const onemini = 60 * 1000;
  const oneH = 3600 * 1000;
  const oneD = 24 * 3600 * 1000;
  const oneM = 30 * oneD;
  const oneY = 365 * oneD;

  if (diff > oneY ) {
    // console.log('几年')
    str = `${Math.round(diff / oneY)}年内`
  }else if (diff < oneY && diff > oneM) {
    // console.log('几个月')
    str = `${Math.round(diff / oneM)}月内`
  }else if (diff < oneM && diff > oneD) {
    // console.log('几天')
    str = `${Math.round(diff / oneD)}天内`
  }else if (diff < oneD && diff > oneH) {
    // console.log('几小时')
    str = `${Math.round(diff / oneH)}小时内`
  }else if (diff < oneH && diff > onemini) {
    // console.log('几分钟')
    str = `${Math.round(diff / onemini)}分钟内`
  }else{
    // console.log('刚刚')
    str = '刚刚'
  }
  // console.log(str, '***')
  return str
}


const unique = (arr) =>{
　　var res =[];
　　var json = {};
　　for(var i=0; i<arr.length; i++){
　　　　if(!json[arr[i]]){
　　　　　　res.push(arr[i]);
　　　　　　json[arr[i]] = 1;
　　　　}
　　}
　　return res;
}


module.exports = {
  unique: unique,
  formatTime: formatTime,
  formatTimeCH: formatTimeCH,
}
