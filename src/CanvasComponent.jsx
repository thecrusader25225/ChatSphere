import { useEffect, useRef, useState } from "react";
import { BiDownArrow, BiEraser } from "react-icons/bi";
import { PiPencil } from "react-icons/pi";

export default function CanvasComponent(){
    const canvasRef=useRef(null)
    // const [canvas, setCanvas]=useState(null)
    const [ctx, setCtx]=useState(null)
    const [isDrawing, setIsDrawing]=useState(false)
    const [tools, setTools]=useState({pencil:true, eraser:false})
    const [color, setColor]=useState('black')

    useEffect(()=>{
        const canvas=canvasRef.current;
        const ctx=canvas.getContext('2d')
        setCtx(ctx)

        canvas.width=canvas.parentElement.clientWidth
        canvas.height=canvas.parentElement.clientHeight

        ctx.fillStyle='white'
        ctx.fillRect(0,0, canvas.width, canvas.height)

    },[])

    function startDrawing(e){
        if(!ctx)return;

        setIsDrawing(true)

        ctx.beginPath()
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
    }
    function draw(e){
        if(!ctx)return;
        if(isDrawing){
            ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY)
            ctx.strokeStyle=tools.pencil?color:'white'
            ctx.lineWidth=5
            ctx.stroke()
        }
    }
    function stopDrawing(){
        setIsDrawing(false)
    }

    console.log("isdrawing", isDrawing  )

    return <div className="relative w-full h-full text-black">
                <canvas ref={canvasRef} 
                    onMouseDown={startDrawing} 
                    onMouseMove={draw} 
                    onMouseUp={stopDrawing}/>
                    <BiDownArrow className="absolute top-0"/>
                <span className="absolute bottom-0 z-50 flex justify-center w-full border">
                    <PiPencil className="" onClick={()=>setTools({pencil:true, eraser:false})}/>
                    <BiEraser className="" onClick={()=>setTools({pencil:false, eraser:true})}/>
                    
                </span>
            </div>
}