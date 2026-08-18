// window.onload = function() {
    twikoo.init({
        envId: 'https://twikoo.yaoyuan.vip/.netlify/functions/twikoo', // 腾讯云环境填 envId；Vercel 环境填地址（https://xxx.vercel.app）
        el: '#tcomment', // 容器元素
    })
    // new Valine({
    //     el: '#vcomment',
    //     notify: true,
    //     verify: false,
    //     // app_id: 'DFIWx0Ig1P6q1pCANzVk1rOp-MdYXbMMI',
    //     // app_key: 'HAVxxg2rAU74oBO1M1ssTo1U',
    //     app_id: 'unnudWlPyrKXJy8ZHA7NZclo-gzGzoHsz',
    //     app_key: 'HAVxxg2rAU74oBO1M1ssTo1U',
    //     placeholder: '说点什么吧......',
    //     avatar: 'monsterid',
    //     pageSize: 5,
    //     visitor: true,
    //     highlight: true,
    //     recordIP: true,
    //     // serverURLs: 'https://dfiwx0ig.api.lncldglobal.com' 
    // });
    // let change = document.getElementById('change')
    // let comment = document.getElementById('vcomment')
    // change.addEventListener('click', function(){
    //     console.log(comment.style.display)
    //     comment.style.display = (comment.style.display == 'none'||comment.style.display=='')? 'block': 'none'
    // })
// }