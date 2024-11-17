import { useEffect, useRef, useState } from "react";
import { BiDownArrow, BiEraser, BiTrash } from "react-icons/bi";
import { PiPencil } from "react-icons/pi";
import { ref, get, set, onValue, remove, push } from "firebase/database";
import { db } from "../firebase-config";
import Loading from "./Loading";

export default function CanvasComponent({ chatUser, user, setIsCanvasOpened }) {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tools, setTools] = useState({ pencil: true, eraser: false });
    const [thicknesses, setThicknesses] = useState([3, 5, 9, 15, 19, 23, 33, 45]);
    const [pencilProperties, setPencilProperties] = useState({ color: "#000000", thickness: 5 });
    const [prevColor, setPrevColor] = useState("black");
    const [tempDotsArr, setTempDotsArr] = useState([]);
    const roomName = chatUser.uid > user.uid ? `${chatUser.uid}_${user.uid}` : `${user.uid}_${chatUser.uid}`;
    const timerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);

    const colorPalette = [
        "#000000", "#FF5733", "#FF8D1A", "#FFD700", "#28B463", "#1ABC9C", "#3498DB", "#5D6D7E",
        "#8E44AD", "#9B59B6", "#C0392B", "#D35400", "#E74C3C", "#F39C12", "#F1C40F", "#27AE60",
        "#2ECC71", "#2980B9", "#34495E", "#7F8C8D", "#BDC3C7", "#E67E22", "#A569BD", "#E91E63",
        "#673AB7", "#3F51B5", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B",
        "#FFC107", "#FF5722", "#795548", "#607D8B"
    ];

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        setCtx(ctx);
        setIsLoading(true);
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        const linesRef = ref(db, `rooms/${roomName}/lines`);
        onValue(linesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = Object.values(snapshot.val());
    
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
    
                ctx.lineJoin = "round";
                ctx.lineCap = "round";
    
                const sessions = {};
                data.forEach(([x, y, color, thickness, sessionId]) => {
                    if (!sessions[sessionId]) sessions[sessionId] = [];
                    sessions[sessionId].push([x, y, color, thickness]);
                });
    
                // Draw lines for each session
                Object.values(sessions).forEach((sessionData) => {
                    for (let i = 0; i < sessionData.length - 1; i++) {
                        const [x1, y1, color1, thickness1] = sessionData[i];
                        const [x2, y2] = sessionData[i + 1];
    
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.strokeStyle = color1;
                        ctx.lineWidth = thickness1;
                        ctx.stroke();
                        ctx.closePath();
                    }
                });
            }
            console.log("DATA FETCHED");
            setIsLoading(false);
        });
    }, []);

    function startDrawing(e) {
        if (!ctx) return;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.currentSession = Date.now(); // Use a timestamp as a unique session ID
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

        // Add each point to the temporary array with the session ID
        const newDot = [offsetX, offsetY, pencilProperties.color, pencilProperties.thickness, ctx.currentSession];
        setTempDotsArr((prev) => [...prev, newDot]);

        ctx.currentX = offsetX;
        ctx.currentY = offsetY;
    }

    function stopDrawing() {
        setIsDrawing(false);
        ctx.closePath();

        if (tempDotsArr.length > 0) {
            const linesRef = ref(db, `rooms/${roomName}/lines`);
            tempDotsArr.forEach((dot) => {
                set(push(linesRef), dot); // Push each dot to Firebase
            });

            // Clear tempDotsArr after pushing to Firebase
            setTempDotsArr([]);
        }
    }

    useEffect(() => {
        if (tools.eraser) {
            setPencilProperties((prev) => ({ ...prev, color: "white" }));
        } else {
            setPencilProperties((prev) => ({ ...prev, color: prevColor }));
        }
    }, [tools]);

    return (
        <div className="relative w-full h-full text-black">
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={isDrawing ? draw : null}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
            />
            <BiDownArrow className="absolute top-0 canvasb" onClick={() => setIsCanvasOpened(false)} />
            <span className="absolute bottom-0 z-50 w-full h-28 flex justify-around items-center rounded-xl bg-black bg-opacity-70 p-2">
                <div className="flex flex-col items-center justify-center w-1/2 h-full">
                    <span className="flex justify-center">
                        <PiPencil
                            onClick={() => setTools({ pencil: true, eraser: false })}
                            className={`canvasb ${tools.pencil && "border border-white"}`}
                        />
                        <BiEraser
                            onClick={() => setTools({ pencil: false, eraser: true })}
                            className={`canvasb ${tools.eraser && "border border-white"}`}
                        />
                        <BiTrash
                            className="canvasb"
                            onClick={() => {
                                remove(ref(db, `rooms/${roomName}/lines`));
                            }}
                        />
                    </span>
                    <span className="flex justify-center items-center">
                        {thicknesses.map((thickness) => (
                            <button
                                className={`rounded-full flex justify-center items-center ${
                                    thickness === pencilProperties.thickness && "border border-white"
                                } bg-black hover:bg-opacity-30 bg-opacity-10 w-12 h-12`}
                                key={thickness}
                                onClick={() => {
                                    setPencilProperties((prev) => ({ ...prev, thickness }));
                                }}
                            >
                                <div
                                    style={{
                                        width: `${thickness}px`,
                                        height: `${thickness}px`,
                                        backgroundColor: pencilProperties.color,
                                    }}
                                    className="rounded-full"
                                />
                            </button>
                        ))}
                    </span>
                </div>
                <div className="w-12 h-12" style={{ backgroundColor: prevColor }} />
                <div className="flex w-1/2 max-w-48 h-full overflow-y-auto flex-wrap">
                    {colorPalette.map((color) => (
                        <button
                            key={color}
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                if (tools.eraser) setTools({ pencil: true, eraser: false });
                                setPencilProperties((prev) => ({ ...prev, color }));
                                setPrevColor(color);
                            }}
                            className={`w-5 h-5 rounded-full p-2 m-0.5 ${color === pencilProperties.color && "border-2 border-white"}`}
                        />
                    ))}
                </div>
            </span>
            {isLoading && <Loading />}
        </div>
    );
}
