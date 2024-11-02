import { useEffect, useRef, useState } from "react";
import { BiDownArrow, BiEraser } from "react-icons/bi";
import { PiPencil } from "react-icons/pi";
import { ref, push, onValue, set, update, get } from "firebase/database";
import { db } from '../firebase-config';
import Loading from "./Loading";

export default function CanvasComponent({ chatUser, user }) {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tools, setTools] = useState({ pencil: true, eraser: false });
    const [thicknesses, setThicknesses]=useState({pencil:[3,5,7,9,11], eraser:[3,5,7,9,11,13]})
    // const [color, setColor] = useState('black');
    const [pencilProperties, setPencilProperties]=useState({color:"black", thickness:5})
    const [eraserProperties, setEraserProperties]=useState({thickness: 5})
    // const tempLinesArr=useRef([])
    const [tempLinesArr, setTempLinesArr]=useState([])
    const roomName = chatUser.uid > user.uid ? `${chatUser.uid}_${user.uid}` : `${user.uid}_${chatUser.uid}`;
    const timerRef=useRef(null)
    const [isLoading, setIsLoading]=useState(false)

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
                if(snapshot.exists()){
                    const data=Object.values(snapshot.val())
                    set(ref(db, `rooms/${roomName}/lines`),[...data, ...tempLinesArr])
                }
            })
            setTempLinesArr([]); // Clear the temporary array
            console.log("lines pushed");
        }, 1000);
    
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
        else setPencilProperties(prev=>({...prev, color:'black'}))
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
            <BiDownArrow className="absolute top-0" />
            <span className="absolute bottom-0 z-50 flex justify-center w-full border">
                <PiPencil onClick={() => setTools({ pencil: true, eraser: false })} />
                {
                    thicknesses.pencil.map(thickness=><button className="border " key={thickness} onClick={()=>{setPencilProperties(prev=>({...prev, thickness:thickness})); setTools({pencil:true, eraser:false})}}>{thickness}</button>)
                }
                <BiEraser onClick={() => setTools({ pencil: false, eraser: true })} />
                {
                    thicknesses.eraser.map(thickness=><button className="border " key={thickness} onClick={()=>{setPencilProperties(prev=>({...prev, thickness:thickness})); setTools({pencil:false, eraser:true})}}>{thickness}</button>)
                }
            </span>
            {isLoading && <Loading/>}
        </div>
    );
}
