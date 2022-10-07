
const WHITE_ENMU = -1;
const BLACK_ENMU = 1;
const NULL_ENMU = 0;

const line = 19;
const block = line - 1;

const boundarySpacing = 40;
const boundaryOffset = boundarySpacing / 2; 

const min = 0;
const max = line - 1;
const boundaryNumMin = -5;
const boundaryNumMax = 5;
const fiveSubarrSwitchType = ['-','|','\\','/']

let gamesOver = false;

let currentPlayer = 1;

let ctx = null;
let pointPositionArray = new Array(line).fill(0).map(() => new Array(line).fill(0));
let width = null;
let height = null;
let interval = null;
let checkerboardWidth = null;
let checkerboardHeight = null;
const app = new Vue({
  el:"#root",
  data:{
    currentWinner:'暂无',
    isGameOver:false
  },
  methods: {
    showWinner(){
      currentPlayer === 1 ? (this.currentWinner = '黑子（玩家）') : (this.currentWinner = '白子（电脑）')
    }
  },
});
const canvas = document.getElementById('canvasElement');
if (canvas.getContext) {
  ctx = canvas.getContext('2d');
  checkerboardWidth = ctx.canvas.scrollWidth;
  checkerboardHeight = ctx.canvas.scrollHeight;
  width = ctx.canvas.scrollWidth - boundarySpacing;
  height = ctx.canvas.scrollHeight - boundarySpacing;
  interval = Number((width/block).toFixed(2));
}
// 四向点位
const FOUR_WAY_POINT = [
  {
    row:3,
    col:3,
  },
  {
    row:3,
    col:9,
  },{
    row:3,
    col:15,
  },{
    row:9,
    col:3,
  },
  {
    row:9,
    col:9,
  },{
    row:9,
    col:15,
  },
  {
    row:15,
    col:3,
  },
  {
    row:15,
    col:9,
  },{
    row:15,
    col:15,
  }
];
canvas.addEventListener('click',playChessClick);
canvas.onmousemove = locationMouseover;
// 初始化棋盘
function initCheckerboard() {
  // 绘制棋盘
  let initialX = boundaryOffset;
  let initialY = boundaryOffset;
  let lineX = 0;
  let lineY = 0;
  ctx.fillStyle = '#f7d774'
  ctx.fillRect(0, 0, checkerboardWidth, checkerboardHeight);
  while(lineX < line){
    ctx.moveTo(initialX,initialY);
    ctx.lineTo(width + boundaryOffset,initialY);
    lineX++;
    initialY += interval;
  }
  initialY = boundaryOffset;
  while(lineY < line){
    ctx.moveTo(initialX,initialY);
    ctx.lineTo(initialX,height + boundaryOffset);
    lineY++;
    initialX += interval;
  }
  ctx.stroke();
  paintingFourWayPoint(FOUR_WAY_POINT,2);
  paintPaintingCurrentArray(pointPositionArray);
}
// 绘制四相点位
function paintingFourWayPoint(FOUR_WAY_POINT,radius){
  FOUR_WAY_POINT.forEach(spot=>{
    ctx.beginPath();
    ctx.arc((spot.col * interval) + boundaryOffset, (spot.row * interval) + boundaryOffset, radius, 0, Math.PI * 2, true);
    ctx.moveTo((spot.col * interval) + boundaryOffset, (spot.row * interval) + boundaryOffset);
    ctx.fillStyle="#000";
    ctx.fill();
    ctx.closePath();
    ctx.stroke();
  })
}
// 绘画棋子
function paintPaintingCurrentArray(pointPositionArray){
  const radius = 10;
  pointPositionArray.forEach((el,index) => {
    el.forEach((node,idx) =>{
      if(node === 0) return;
      node === 1 ? ctx.fillStyle="#000" : ctx.fillStyle="#fff";
      ctx.beginPath();
      ctx.arc((idx * interval) + boundaryOffset, (index * interval) + boundaryOffset, radius, 0, Math.PI * 2, true);
      ctx.moveTo((idx * interval) + boundaryOffset, (index * interval) + boundaryOffset);
      ctx.fill();
      ctx.closePath();
      ctx.stroke();
    })
  })
}
// 落子定位框
function locationMouseover(evnet){
  if(gamesOver) return;
  if(currentPlayer === -1) return;
  window.requestAnimationFrame(()=>{
    repaintCanvas();
    const { offsetX, offsetY } = evnet;
    const positionX = parseInt((offsetX + boundaryOffset) / interval) - 1;
    const positionY = parseInt((offsetY + boundaryOffset) / interval) - 1;
    if(positionX < min || positionX > max) return;
    if(positionY < min || positionY > max) return;
    pointPositionArray[positionY][positionX] === 0 ? (ctx.strokeStyle = '#24d86e') : (ctx.strokeStyle = '#ff1920')
    ctx.lineWidth = 2;
    ctx.strokeRect((positionX * interval + boundaryOffset) - 10, (positionY * interval + boundaryOffset) - 10, 20, 20);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
  });
}
// 下棋点击事件
function playChessClick(evnet){
  if(gamesOver) return;
  if(currentPlayer === -1) return;
  const { offsetX, offsetY } = evnet;
  const positionX = parseInt((offsetX + boundaryOffset) / interval) - 1;
  const positionY = parseInt((offsetY + boundaryOffset) / interval) - 1;
  if(pointPositionArray[positionY][positionX] !== 0) return;
    pointPositionArray[positionY][positionX] = 1;
    repaintCanvas();
    if(settlement({x:positionY,y:positionX})) return gamesOverFunc();
    currentPlayer = -1;
    return AiPlayer();
}
// 清空画布
function clearCanvas(){
  ctx.clearRect(0, 0, checkerboardWidth, checkerboardHeight);
}
// 重绘画布
function repaintCanvas(){
  clearCanvas();
  initCheckerboard();
}
// 结算
const settlement = ({x,y}) => judgeFiveSubarr(x,y);
// 判断当前棋子是否五子连珠
function judgeFiveSubarr(x,y) {
  let i = 0;
  while( i < fiveSubarrSwitchType.length){
    let fiveSubarrArray = null;
    fiveSubarrArray = fiveSubarrSwitch({x,y,type:fiveSubarrSwitchType[i]});
    i++;
    let bool = isItContinuous(fiveSubarrArray);
    if(bool) return true;
  }
  return false;
}
// 判断数组是否五子连珠
function isItContinuous(fiveSubarrArray){
  let counter = 0;
  return fiveSubarrArray.some(item=>{
    item ? (counter += 1) : (counter = 0); 
    return counter < 5 ? false : true;
  })
}
// 五子连珠判断规则
function fiveSubarrSwitch({x,y,type,player = currentPlayer}){
  let fiveSubarrArray = [];
  let currentNum = boundaryNumMin;
  switch (type) {
    case '|':
        while(currentNum <= boundaryNumMax){
          const Xnumber = x + currentNum;
          currentNum++;
          if(Xnumber<min || Xnumber > max) continue;
          fiveSubarrArray.push(pointPositionArray[Xnumber][y] === player ? true : ( pointPositionArray[Xnumber][y] === 0 ? 0 : false ));
        }
      break;
    case '-':
      
        while(currentNum <= boundaryNumMax){
          const Ynumber = y + currentNum;
          currentNum++;
          if(Ynumber<min || Ynumber > max) continue;
          fiveSubarrArray.push(pointPositionArray[x][Ynumber] === player ? true : ( pointPositionArray[x][Ynumber] === 0 ? 0 : false ));
        }
      
      break;
    case '\\':
      
        while(currentNum <= boundaryNumMax){
          const Xnumber = x + currentNum
          const Ynumber = y + currentNum
          currentNum++;
          if(Xnumber<min || Xnumber > max) continue;
          if(Ynumber<min || Ynumber > max) continue;
          fiveSubarrArray.push(pointPositionArray[Xnumber][Ynumber] === player ? true : ( pointPositionArray[Xnumber][Ynumber] === 0 ? 0 : false ));
      }
      break;
    case '/':
        while(currentNum <= boundaryNumMax){
          const Xnumber = x + currentNum
          const Ynumber = y - currentNum
          currentNum++;
          if(Xnumber<min || Xnumber > max) continue;
          if(Ynumber<min || Ynumber > max) continue;
          fiveSubarrArray.push(pointPositionArray[Xnumber][Ynumber] === player ? true : ( pointPositionArray[Xnumber][Ynumber] === 0 ? 0 : false ));
        }
      break;
  }
  return fiveSubarrArray;
}
// 电脑玩家(纯防守)
function AiPlayer(){
  if(gamesOver) return;
  const MaxHazardLevel = defenseLevel(1);
  const MaxAttackLevel = defenseLevel(-1);
  let playChess = MaxHazardLevel;
  if(MaxAttackLevel){
    if(MaxAttackLevel.level >=4){
      playChess = MaxAttackLevel
    }else{
      MaxAttackLevel.level > MaxHazardLevel.level ? (playChess = MaxAttackLevel) : null;
    }
  }
  const {positionX,positionY} = AIfiveSubarrSwitch({x:playChess.x,y:playChess.y,MaxHazardLevel:playChess});
  repaintCanvas();
  if(settlement({x:positionX,y:positionY})) return gamesOverFunc();
  currentPlayer = 1;
}
// 危险级别
function hazardLevel(fiveSubarrArray,type){
  let counter = 0;
  let counterArray = [];
  let start = 0;
  let end = 0;
  let indexArray = [];
  let allowSlotNumv = true;
  let slotIndex = null;
  let slotIndexArray = [];
  fiveSubarrArray.forEach((item,idx)=>{
    if(item){
      counter +=1;
      start ? null : start = idx;
      end = idx; 
      if(idx === fiveSubarrArray.length-1){
        counterArray.push(counter);
        indexArray.push({start,end});
        slotIndexArray.push(slotIndex)
        counter = 0;
        start = 0;
        end = 0;
        allowSlotNumv = true;
        slotIndex = null;
      }
    }else{
      if(allowSlotNumv && start !== 0 && item === 0 && slotIndex === null && idx < fiveSubarrArray.length-1){
        allowSlotNumv = false;
        slotIndex = idx;
        end = idx; 
        if(fiveSubarrArray[idx] === true) counter +=1;
      }else{
        counterArray.push(counter);
        indexArray.push({start,end});
        slotIndexArray.push(slotIndex)
        counter = 0;
        start = 0;
        end = 0;
        allowSlotNumv = true;
        slotIndex = null;
      }
    }
  })
  counterArray = counterArray.map((item,index) =>{
    if(item){
      if(fiveSubarrArray[indexArray[index].start - 1] === false && fiveSubarrArray[indexArray[index].end + 1] === false) return 0;
      if(fiveSubarrArray[indexArray[index].start - 1] === false && fiveSubarrArray[indexArray[index].end + 1] === undefined) return 0;
      if(fiveSubarrArray[indexArray[index].start - 1] === undefined && fiveSubarrArray[indexArray[index].end + 1] === false) return 0;
      if(fiveSubarrArray[indexArray[index].start - 1] === undefined && fiveSubarrArray[indexArray[index].end + 1] === undefined) return 0;
    }
    return item;
  })
  let level = Math.max.apply(null,counterArray);
  const Indexes = counterArray.findIndex(item => item === level);
  return{
    type,
    level,
    slotIndex:slotIndexArray[Indexes],
    index:indexArray[Indexes],
    arr:fiveSubarrArray,
  }
}
// 攻防等级
function defenseLevel(player = -1){
  let maxAttackLevelArray = [];
  pointPositionArray.forEach( (Xitem , x) =>{
    pointPositionArray[x].forEach((Yitem, y)=>{
      const levelArray = []
      if(Yitem === player){
        let i = 0; 
        while( i < fiveSubarrSwitchType.length){
          let fiveSubarrArray = null;
          fiveSubarrArray = fiveSubarrSwitch({x,y,type:fiveSubarrSwitchType[i],player});
          levelArray.push(Object.assign(hazardLevel(fiveSubarrArray,fiveSubarrSwitchType[i]),{x,y}))
          i++;
        }
        const MaxAttackLevel = levelArray.reduce((prev,cur)=>prev.level > cur.level ? prev : cur);
        maxAttackLevelArray.push(MaxAttackLevel);
      }
    })
  })
  return maxAttackLevelArray.length > 0 ? maxAttackLevelArray.reduce((prev,cur)=>prev.level > cur.level ? prev : cur) : null;
};
// 电脑下棋五子连珠判断规则
function AIfiveSubarrSwitch({x,y,MaxHazardLevel}){
  let currentNum = boundaryNumMin;
  let currentIndex = 0;
  let targetNum = MaxHazardLevel.slotIndex === null ? (MaxHazardLevel.index.start) : MaxHazardLevel.slotIndex;
  switch (MaxHazardLevel.type) {
    case '|':
        while(currentNum <= boundaryNumMax){
          const Xnumber = x + currentNum;
          currentNum++;
          if(Xnumber<min || Xnumber > max) continue;
          currentIndex++;
          if(currentIndex>=targetNum){
            if(pointPositionArray[Xnumber][y]!==0) continue;
            let positionX = Xnumber,positionY = y;
            if(pointPositionArray[Xnumber][y]===0){
              pointPositionArray[Xnumber][y] = currentPlayer;
            }
            return {positionX,positionY};
          }
        }
      break;
    case '-':
        while(currentNum <= boundaryNumMax){
          const Ynumber = y + currentNum;
          currentNum++;
          if(Ynumber<min || Ynumber > max) continue;
          currentIndex++;
          if(currentIndex>=targetNum){
            if(pointPositionArray[x][Ynumber]!==0) continue;
            let positionX = x,positionY = Ynumber;
            if(pointPositionArray[x][Ynumber]===0){
              pointPositionArray[x][Ynumber] = currentPlayer;
            }
            return {positionX,positionY};
          }
        }
      break;
    case '\\':
      
        while(currentNum <= boundaryNumMax){
          const Xnumber = x + currentNum
          const Ynumber = y + currentNum
          currentNum++;
          if(Xnumber<min || Xnumber > max) continue;
          if(Ynumber<min || Ynumber > max) continue;
          currentIndex++;
          if(currentIndex>=targetNum){
            if(pointPositionArray[Xnumber][Ynumber]!==0) continue;
            let positionX = Xnumber,positionY = Ynumber;
            if(pointPositionArray[Xnumber][Ynumber]===0){
              pointPositionArray[Xnumber][Ynumber] = currentPlayer;
            }
            return {positionX,positionY};
          }
        }
      break;
    case '/':
        while(currentNum <= boundaryNumMax){
          const Xnumber = x + currentNum
          const Ynumber = y - currentNum
          currentNum++;
          if(Xnumber<min || Xnumber > max) continue;
          if(Ynumber<min || Ynumber > max) continue;
          currentIndex++;
          if(currentIndex>=targetNum){
            if(pointPositionArray[Xnumber][Ynumber]!==0) continue;
            let positionX = Xnumber,positionY = Ynumber;
            if(pointPositionArray[Xnumber][Ynumber]===0){
              pointPositionArray[Xnumber][Ynumber] = currentPlayer;
            }
            return {positionX,positionY};
          }
        }
      break;
  }
}
// 游戏结束
function gamesOverFunc(){
  gamesOver = true;
  app.showWinner();
}
initCheckerboard();
