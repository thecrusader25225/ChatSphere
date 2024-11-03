import { useEffect, useRef, useState } from "react";
import { BiDownArrow, BiEraser, BiTrash } from "react-icons/bi";
import { PiPencil } from "react-icons/pi";
import { ref, push, onValue, set, update, get, remove } from "firebase/database";
import { db } from '../firebase-config';
import Loading from "./Loading";

export default function CanvasComponent({ chatUser, user, setIsCanvasOpened }) {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tools, setTools] = useState({ pencil: true, eraser: false });
    const [thicknesses, setThicknesses]=useState([3,5,9, 15, 19, 23, 33, 45])
    // const [color, setColor] = useState('black');
    const [pencilProperties, setPencilProperties]=useState({color:"#000000", thickness:5})
    const [eraserProperties, setEraserProperties]=useState({thickness: 5})
    const [prevColor, setPrevColor]=useState("black")
    // const tempLinesArr=useRef([])
    const [tempLinesArr, setTempLinesArr]=useState([])
    const roomName = chatUser.uid > user.uid ? `${chatUser.uid}_${user.uid}` : `${user.uid}_${chatUser.uid}`;
    const timerRef=useRef(null)
    const [isLoading, setIsLoading]=useState(false)
    const colorPalette = [
        "#000000", //black
        "#FF5733", // Vibrant Red
        "#FF8D1A", // Orange
        "#FFD700", // Gold
        "#28B463", // Green
        "#1ABC9C", // Turquoise
        "#3498DB", // Light Blue
        "#5D6D7E", // Slate Gray
        "#8E44AD", // Purple
        "#9B59B6", // Light Purple
        "#C0392B", // Dark Red
        "#D35400", // Dark Orange
        "#E74C3C", // Coral
        "#F39C12", // Amber
        "#F1C40F", // Yellow
        "#27AE60", // Forest Green
        "#2ECC71", // Light Green
        "#2980B9", // Blue
        "#34495E", // Dark Slate
        "#7F8C8D", // Gray
        "#BDC3C7", // Light Gray
        "#E67E22", // Pumpkin Orange
        "#A569BD", // Lavender
        "#E91E63", // Pink
        "#673AB7", // Deep Purple
        "#3F51B5", // Indigo
        "#00BCD4", // Cyan
        "#009688", // Teal
        "#4CAF50", // Medium Green
        "#8BC34A", // Lime Green
        "#CDDC39", // Lime
        "#FFEB3B", // Light Yellow
        "#FFC107", // Amber
        "#FF5722", // Deep Orange
        "#795548", // Brown
        "#607D8B"  // Blue Gray
    ];
    

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        setCtx(ctx);
        setIsLoading(true)
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Fetching lines from Firebase
        const linesRef = ref(db, `rooms/${roomName}/lines`);
        onValue(linesRef, snapshot => {
            if (snapshot.exists()) {
                
                const data = Object.values(snapshot.val());
                // console.log(data)
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Refilling the background
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                 //smooth line properties
                ctx.lineJoin = 'round';
                ctx.lineCap = 'round';
                for(let i=0;i<data.length;i+=6)
                {
                    ctx.beginPath();
                    ctx.moveTo(data[i], data[i+1]);
                    ctx.lineTo(data[i+2], data[i+3]);
                    ctx.strokeStyle =data[i+4];
                    ctx.lineWidth = data[i+5];
                    ctx.stroke();
                    ctx.closePath();
                }
               
            }
            console.log("DATA FETCHED")
            setIsLoading(false)
        });
      
    }, []);

    function startDrawing(e) {
        if (!ctx) return;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        // Store the starting coordinates for Firebase push
        ctx.currentX = e.nativeEvent.offsetX;
        ctx.currentY = e.nativeEvent.offsetY;
    }

    function draw(e) {
        if (!ctx || !isDrawing) return;
    
        const offsetX = e.nativeEvent.offsetX;
        const offsetY = e.nativeEvent.offsetY;
    
        ctx.lineTo(offsetX, offsetY);
        ctx.strokeStyle = pencilProperties.color;
        ctx.lineWidth = pencilProperties.thickness;
        ctx.stroke();
    
        // Clear any existing timeout
        if (timerRef.current) clearTimeout(timerRef.current);
    
        // Update the tempLinesArr with the new line as an array
        const newLine = [ctx.currentX, ctx.currentY, offsetX, offsetY, pencilProperties.color, pencilProperties.thickness];
        setTempLinesArr(prev => [...prev, ...newLine]); // Append the new line array to tempLinesArr
    
        // Set a timeout to push to Firebase
        timerRef.current = setTimeout(() => {
            // tempLinesArr.forEach(tempLine=>push(ref(db, `rooms/${roomName}/lines`), tempLine)) // Push all lines
            
            // update(ref(db, `rooms/${roomName}/lines`), {...tempLinesArr})

            // use get and set

            get(ref(db, `rooms/${roomName}/lines`)).then(snapshot=>{
                    const data=Object.values(snapshot.val() || [])
                    let filteredData=data;
                    // if(data!=[]){
                    //     //removing white lines coords
                    //     filteredData=data.filter((d, index, arr)=>{
                    //         if(arr[index+4]!='white' && arr[index+3]!='white' && arr[index+2]!='white' && arr[index+1]!='white' && arr[index]!='white' && arr[index-1]!='white')
                    //             return d
                    //     })
                    // }
                    console.log("data without whites", filteredData)
                    set(ref(db, `rooms/${roomName}/lines`),[...filteredData, ...tempLinesArr])
            })
            setTempLinesArr([]); // Clear the temporary array
            console.log("lines pushed");
        }, 2000);
    
        // Update current coordinates for the next line segment
        ctx.currentX = offsetX;
        ctx.currentY = offsetY;
    }
    

    function stopDrawing() {
        setIsDrawing(false);
        ctx.closePath(); // Ensure the path is closed after drawing
    }
    
    useEffect(()=>{
        if(tools.eraser)
           setPencilProperties(prev=>({...prev, color:'white'}))
        else setPencilProperties(prev=>({...prev, color:prevColor}))
        console.log(tools)
    },[tools])
    // console.log("tools", tools)
    console.log("is loading", isLoading)
    return (
        <div className="relative w-full h-full text-black">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={isDrawing? draw:null}
                onMouseUp={stopDrawing}
            />
            <BiDownArrow className="absolute top-0 canvasb " onClick={()=>setIsCanvasOpened(false)}/>
            <span className="absolute bottom-0 z-50  w-full h-28 flex justify-around items-center rounded-xl bg-black bg-opacity-70 p-2">
                <div className="flex flex-col items-center justify-center w-1/2 h-full">
                    <span className="flex justify-center ">
                        <PiPencil onClick={() => setTools({ pencil: true, eraser: false })} className={`canvasb ${tools.pencil && "border border-white"}`}/>
                        <BiEraser onClick={() => setTools({ pencil: false, eraser: true })} className={`canvasb ${tools.eraser && "border border-white"}`}/>
                        <BiTrash className="canvasb" onClick={()=>{remove(ref(db, `rooms/${roomName}/lines`)); }}/>
                    </span>
                    <span className="flex justify-center items-center">
                        {
                            thicknesses.map(thickness=><button
                                className={` rounded-full flex justify-center items-center ${thickness===pencilProperties.thickness && "border border-white"} bg-black hover:bg-opacity-30 bg-opacity-10 w-12 h-12`}
                                key={thickness}
                                onClick={()=>{setPencilProperties(prev=>({...prev, thickness:thickness})); setEraserProperties(prev=>({...prev, thickness:thickness}))}}>
                                    <div style={{width:`${thickness}px`, height:`${thickness}px`, backgroundColor:pencilProperties.color}} className="rounded-full"/>
                                </button>
                            )
                        }
                    </span>
                </div>
                <div className="w-12 h-12" style={{backgroundColor:prevColor}}/>
                <div className="flex  w-1/2 max-w-48 h-full overflow-y-auto flex-wrap">
                        {
                            colorPalette.map((color,i)=><><button 
                            style={{backgroundColor:color}} 
                            onClick={()=>{ tools.eraser && setTools({pencil:true, eraser:false}); 
                            setPencilProperties(prev=>({...prev, color:color})); 
                            setPrevColor(color)
                        }} 
                            className={`w-5 h-5 rounded-full p-2 m-0.5 ${color===pencilProperties.color && 'border'}`} />
                            
                            </>)
                        }
                </div>
            </span>
            {isLoading && <Loading/>}
        </div>
    );
}
