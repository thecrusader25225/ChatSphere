import { useEffect, useRef, useState } from "react";
import { BiDownArrow, BiEraser } from "react-icons/bi";
import { PiPencil } from "react-icons/pi";
import { ref, push, onValue } from "firebase/database";
import { db } from '../firebase-config';

export default function CanvasComponent({ chatUser, user }) {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tools, setTools] = useState({ pencil: true, eraser: false });
    const [color, setColor] = useState('black');
    // const tempLinesArr=useRef([])
    const [tempLinesArr, setTempLinesArr]=useState([])
    const roomName = chatUser.uid > user.uid ? `${chatUser.uid}_${user.uid}` : `${user.uid}_${chatUser.uid}`;
    const timerRef=useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        setCtx(ctx);

        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        ctx.fillStyle = 'grey';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Fetching lines from Firebase
        const linesRef = ref(db, `rooms/${roomName}/lines`);
        onValue(linesRef, snapshot => {
            if (snapshot.exists()) {
                const data = Object.values(snapshot.val());
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Refilling the background
                ctx.fillStyle = 'grey';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.beginPath();
                data.forEach(line => {
                    ctx.moveTo(line[0], line[1]);
                    ctx.lineTo(line[2], line[3]);
                    ctx.strokeStyle = tools.pencil ? color : 'white';
                    ctx.lineWidth = 5;
                    ctx.stroke();
                });
                ctx.closePath();
            }
        });
        console.log("DATA FETCHED")
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
        ctx.strokeStyle = tools.pencil ? color : 'white';
        ctx.lineWidth = 5;
        ctx.stroke();
    
        // Clear any existing timeout
        if (timerRef.current) clearTimeout(timerRef.current);
    
        // Update the tempLinesArr with the new line as an array
        const newLine = [ctx.currentX, ctx.currentY, offsetX, offsetY];
        setTempLinesArr(prev => [...prev, newLine]); // Append the new line array to tempLinesArr
    
        // Set a timeout to push to Firebase
        timerRef.current = setTimeout(() => {
            tempLinesArr.forEach(tempLine=>push(ref(db, `rooms/${roomName}/lines`), tempLine)) // Push all lines
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
    // console.log("tools", tools)
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
                <BiEraser onClick={() => setTools({ pencil: false, eraser: true })} />
            </span>
        </div>
    );
}
