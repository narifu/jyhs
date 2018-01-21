const _ = require("lodash");

module.exports ={
    randomWord(randomFlag, min, max){
        var str = "",
            range = min,
            arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
     
        // 随机产生
        if(randomFlag){
            range = Math.round(Math.random() * (max-min)) + min;
        }
        for(var i=0; i<range; i++){
            pos = Math.round(Math.random() * (arr.length-1));
            str += arr[pos];
        }
        return str;
    },
    buildKey(request){
        const cookies = request.headers.cookie;
        let key = "key";
        if(cookies){
            _.each(cookies.split(";"),(cookie)=>{
                const jid = cookie.split("=")[0];
                const value = cookie.split("=")[1];
                if("JSESSIONID"==_.trim(jid)){
                    key = value;
                }   
            });
        }
        return key;
    },
    trim(s){
        if(s){
            return s.replace(/(^\s*)|(\s*$)/g, "");
        }else{
            return "";
        }
    }
}