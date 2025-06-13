import Image from "next/image";
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Carousel, CarouselNext, CarouselContent, CarouselItem, CarouselPrevious } from "@/components/ui/carousel";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const ImageSlider = ({ open, onOpenChange, images }: { open: boolean, onOpenChange: (open: boolean) => void, images: string[] }) => {
    const [zoom, setZoom] = useState(1);
    
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        const newZoom = Math.min(Math.max(zoom + delta, 0.5), 3);
        setZoom(newZoom);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[90vw] h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Image</DialogTitle>
                </DialogHeader>
                <Carousel>
                    <CarouselContent className="p-4" onWheel={handleWheel}>
                        {images.map((image, index) => (
                            <CarouselItem key={index}>
                                <div className="overflow-auto h-[60vh]">
                                    <Image 
                                        src={image} 
                                        alt='image' 
                                        className="w-fit h-fit object-contain aspect-16/9 mx-auto transition-transform duration-200" 
                                        width={300} 
                                        height={200}
                                        style={{ transform: `scale(${zoom})` }}
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-1" />
                    <CarouselNext className="right-1" />
                </Carousel>
            </DialogContent>
        </Dialog>
    )
}

export default ImageSlider