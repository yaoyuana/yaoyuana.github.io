let markObj = {}
let styleObj = {}
let nameList = []
let pointList = []
let markerList = []
// 获取 json 文件
fetch('/links/linklist.json')
.then(response => response.json())
.then(res => {
    markObj = res
    // 获取 样式 文件
    fetch('/js/src/ZONE/styleObj.json')
    .then(response => response.json())
    .then(resp => {
        styleObj = resp
        mapInit()
    });
});

window.mapInit = function(){
    map = new BMapGL.Map("baiduMap");
    map.setMapStyleV2({styleJson: styleObj})
    centerPoint = new BMapGL.Point(114.055739,32.298035);  //  中心点
    unIcon = new BMapGL.Icon('/images/mouse/normal.cur', new BMapGL.Size(50,50));  //  不能点
    myIcon = new BMapGL.Icon('/images/mouse/text.cur', new BMapGL.Size(50,50));  //  能点
    myActive = new BMapGL.Icon('/images/mouse/normal.cur', new BMapGL.Size(50,50));  //  被点
    map.centerAndZoom(centerPoint,5)
    map.enableScrollWheelZoom();  // 鼠标控制缩放
    map.addEventListener('tilesloaded', () => {
        // show()
    }) //待地图资源加载完成干点什么
    show()
}

function moveTo(marker,nameList,pointList,i){
    if(nameList[i].type){  // 允许被点
        if(!nameList[i].clickFlag){  // 首次被点
            map.centerAndZoom(pointList[i],20);
            nameList[i].clickFlag = !nameList[i].clickFlag
            map.on('zoomend',function() { 
                if(map.getZoom() >= 10){
                    marker.setIcon(myActive);
                }
                if (map.getZoom() > 19){
                    map.setHeading(64.5);
                    map.setTilt(73);  //  设置角度
                }
            });
        }else{
            if(nameList[i].type  &&  nameList[i].site){
                window.open(nameList[i].site, '_blank').location;
            }
        }
    }
}
function show(){
    if(document.getElementsByClassName('anchorBL')[0]){
        document.getElementsByClassName('anchorBL')[0].style.display = "none";
    }
    for(let i = 0 ;i< markObj.length ; i++){
        nameList.push({
            name: markObj[i].name,
            clickFlag: false,
            type: markObj[i].message.type,
            site: markObj[i].site,
            avatar: markObj[i].avatar
        })
        pointList.push(new BMapGL.Point(markObj[i].message.lat,markObj[i].message.lng))
        markerList.push(
            new BMapGL.Marker(
                pointList[i],
                { icon:new BMapGL.Icon(markObj[i].avatar, new BMapGL.Size(50,50)) }
            )
        )
    }
    map.setViewport(pointList)
    markSection(markerList);
    // setTimeout(()=>{getCurrentPosition();getCurrentPosition3()},2000)
}
// 根据地区名称高亮某个区域
function highLightSpace (name) {
    var bd = new BMapGL.Boundary();
    bd.get(name, function (rs) {
        var count = rs.boundaries.length; //行政区域的点有多少个
        for (var i = 0; i < count; i++) {
            var path = [];
            str = rs.boundaries[i].replace(' ', '');
            points = str.split(';');
            for (var j = 0; j < points.length; j++) {
                var lng = points[j].split(',')[0];
                var lat = points[j].split(',')[1];
                path.push(new BMapGL.Point(lng, lat));
            }
            var prism = new BMapGL.Prism(path, 5000, {
                topFillColor: '#5679ea',
                topFillOpacity: 0.5,
                sideFillColor: '#5679ea',
                sideFillOpacity: 0.9
            });
            map.addOverlay(prism);
        }
    }); 
}
//使用SDK当前位置
function getCurrentPosition() {
    var geolocation = new BMapGL.Geolocation();
    var gc = new BMapGL.Geocoder();//创建地理编码器
    geolocation.enableSDKLocation();
    geolocation.getCurrentPosition(function(r){
        if(this.getStatus() == BMAP_STATUS_SUCCESS){
            // var mk = new BMapGL.Marker(r.point);
            // map.addOverlay(mk);
            // map.panTo(r.point);
            // alert('TMD这位置不准啊，用了坐标转换器也还是不准，贼' + r.point.lng + ',' + r.point.lat);
            // var pt = r.point;   
            // map.panTo(pt);//移动地图中心点
            // gc.getLocation(pt, function(rs){    
            //     var addComp = rs.addressComponents;
            //     alert(addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber);    
            // }); 
        }
        else {
            alert('failed'+this.getStatus());
        }        
    });
}
// 使用浏览器获取当前位置
function getCurrentPosition2() {
    var geolocation = new BMapGL.Geolocation();
    geolocation.getCurrentPosition(function(r){
        if(this.getStatus() == BMAP_STATUS_SUCCESS){
            var mk = new BMapGL.Marker(r.point);
            map.addOverlay(mk);
            map.panTo(r.point);
            alert('您的位置：'+r.point.lng+','+r.point.lat);
        }
        else {
            alert('failed'+this.getStatus());
        }        
    });
}
//使用Ip定位获取当前所在城市
function getCurrentPosition3() {
    var myCity = new BMapGL.LocalCity();
    myCity.get(myFun);
}
function myFun(result){
    var cityName = result.name;
    highLightSpace(cityName)
    // map.setCenter(cityName);
}
function markSection(markerList){    //标记
    map.clearOverlays() // 清除所有标记
    map.centerAndZoom(centerPoint,6.2);
    map.on('zoomend',function() { 
        if(map.getZoom()<8){
            for(let i = 0;i<nameList.length;i++){
                nameList[i].clickFlag = false
                nameList[i].type && markerList[i].setIcon(new BMapGL.Icon(nameList[i].avatar, new BMapGL.Size(50,50)))
            }
        }
    })
    for(let i = 0; i < markerList.length ; i++){
        let marker = markerList[i]
        if(!nameList[i].type){
            marker.setIcon(unIcon)
        }
        map.addOverlay(marker);  //  将标记点添加到地图上
        //  设置悬停标签
        marker.addEventListener("mouseover",function(e){
            const label = new BMapGL.Label(nameList[i].name,{offset:new BMapGL.Size(-60,-60)});
            label.setStyle({
                background: "rgb(22,22,22)",border: '1px solid #c0c0c0',borderRadius: "5px",color: '#c0c0c0',  height: "26px",
                lineHeight: "26px", textAlign: "center", width: "max-content",padding:'3px 16px 3px 20px'
            });
            marker.setLabel(label);
        });
        //  隐藏悬停标签
        marker.addEventListener("mouseout",function(e){  
            const label = this.getLabel();
            label.setContent("");
            label.setStyle({border:"none",width:"0px",padding:"0px"});
        });
        // // 点击移至标点并转动视角
        marker.addEventListener('click',function(event){
            moveTo(marker,nameList,pointList,i)
        });
    }
}