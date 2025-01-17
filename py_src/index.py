import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk, ImageOps, ImageEnhance, ImageFilter
import numpy as np
from math import sqrt

class ImageEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("Image Manipulation!")
        self.root.geometry("1200x800")

        self.original_image = None
        self.current_image = None
        self.photo_image = None
        self.filename = None
        self.undo_stack = []
        self.redo_stack = []

        self.setup_ui()

    def setup_ui(self):
        self.main_frame = ttk.Frame(self.root)
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

        self.control_panel = ttk.Frame(self.main_frame, width=200)
        self.control_panel.pack(side=tk.LEFT, fill=tk.Y, padx=5, pady=5)

        self.image_frame = ttk.Frame(self.main_frame)
        self.image_frame.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)

        self.canvas = tk.Canvas(self.image_frame, bg='gray90')
        self.canvas.pack(fill=tk.BOTH, expand=True)

        ttk.Button(self.control_panel, text="Open Image", command=self.open_image).pack(fill=tk.X, pady=2)
        ttk.Button(self.control_panel, text="Save Image", command=self.save_image).pack(fill=tk.X, pady=2)
        ttk.Button(self.control_panel, text="Undo", command=self.undo).pack(fill=tk.X, pady=2)
        ttk.Button(self.control_panel, text="Redo", command=self.redo).pack(fill=tk.X, pady=2)

        ttk.Label(self.control_panel, text="Effects", font=('Arial', 10, 'bold')).pack(pady=5)
        
        effects = [
            ("Blur", self.blur_image),
            ("Sharpen", self.sharpen_image),
            ("Invert", self.invert_image),
            ("Rotate Right", lambda: self.rotate_image(90)),
            ("Rotate Left", lambda: self.rotate_image(-90)),
            ("Circle Crop", self.circle_crop),
            ("Enhance Color", self.enhance_color),
            ("Black & White", self.convert_bw),
            ("Swirl", self.swirl_image)
        ]

        for effect_name, command in effects:
            ttk.Button(self.control_panel, text=effect_name, command=command).pack(fill=tk.X, pady=2)

        self.crop_frame = ttk.LabelFrame(self.control_panel, text="Crop")
        self.crop_frame.pack(fill=tk.X, pady=5)
        ttk.Button(self.crop_frame, text="Start Crop", command=self.start_crop).pack(fill=tk.X, pady=2)

    def open_image(self):
        self.filename = filedialog.askopenfilename(
            filetypes=[("Image files", "*.png *.jpg *.jpeg *.gif *.bmp *.tiff")]
        )
        if self.filename:
            self.original_image = Image.open(self.filename)
            self.current_image = self.original_image.copy()
            self.update_image_display()
            self.undo_stack.clear()
            self.redo_stack.clear()

    def save_image(self):
        if self.current_image:
            save_path = filedialog.asksaveasfilename(
                defaultextension=".png",
                filetypes=[("PNG files", "*.png"), ("JPEG files", "*.jpg")]
            )
            if save_path:
                self.current_image.save(save_path)
                messagebox.showinfo("Success", "Image saved successfully!")

    def update_image_display(self):
        if self.current_image:
            canvas_width = self.canvas.winfo_width()
            canvas_height = self.canvas.winfo_height()
            
            img_width, img_height = self.current_image.size
            ratio = min(canvas_width/img_width, canvas_height/img_height)
            new_width = int(img_width * ratio)
            new_height = int(img_height * ratio)

            resized_image = self.current_image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            self.photo_image = ImageTk.PhotoImage(resized_image)
            
            self.canvas.delete("all")
            self.canvas.create_image(
                canvas_width//2, 
                canvas_height//2, 
                image=self.photo_image, 
                anchor="center"
            )

    def push_to_undo_stack(self):
        self.undo_stack.append(self.current_image.copy())
        self.redo_stack.clear()

    def undo(self):
        if self.undo_stack:
            self.redo_stack.append(self.current_image.copy())
            self.current_image = self.undo_stack.pop()
            self.update_image_display()

    def redo(self):
        if self.redo_stack:
            self.undo_stack.append(self.current_image.copy())
            self.current_image = self.redo_stack.pop()
            self.update_image_display()

    def blur_image(self):
        if self.current_image:
            self.push_to_undo_stack()
            self.current_image = self.current_image.filter(ImageFilter.BLUR)
            self.update_image_display()

    def sharpen_image(self):
        if self.current_image:
            self.push_to_undo_stack()
            self.current_image = self.current_image.filter(ImageFilter.SHARPEN)
            self.update_image_display()

    def invert_image(self):
        if self.current_image:
            self.push_to_undo_stack()
            if self.current_image.mode == 'RGBA':
                r, g, b, alpha = self.current_image.split()
                rgb_image = Image.merge('RGB', (r, g, b))
                inverted_rgb = ImageOps.invert(rgb_image)
                r, g, b = inverted_rgb.split()
                self.current_image = Image.merge('RGBA', (r, g, b, alpha))
            else:
                original_mode = self.current_image.mode
                rgb_image = self.current_image.convert('RGB')
                self.current_image = ImageOps.invert(rgb_image)
                if original_mode != 'RGB':
                    self.current_image = self.current_image.convert(original_mode)
            self.update_image_display()

    def rotate_image(self, angle):
        if self.current_image:
            self.push_to_undo_stack()
            self.current_image = self.current_image.rotate(angle, expand=True)
            self.update_image_display()

    def circle_crop(self):
        if self.current_image:
            self.push_to_undo_stack()
            mask = Image.new('L', self.current_image.size, 0)
            width, height = self.current_image.size
            radius = min(width, height) // 2
            center = (width // 2, height // 2)
            
            for x in range(width):
                for y in range(height):
                    dist = sqrt((x - center[0]) ** 2 + (y - center[1]) ** 2)
                    mask.putpixel((x, y), 255 if dist <= radius else 0)
            
            output = Image.new('RGBA', self.current_image.size, (0, 0, 0, 0))
            output.paste(self.current_image, mask=mask)
            self.current_image = output
            self.update_image_display()

    def enhance_color(self):
        if self.current_image:
            self.push_to_undo_stack()
            enhancer = ImageEnhance.Color(self.current_image)
            self.current_image = enhancer.enhance(1.5)
            self.update_image_display()

    def convert_bw(self):
        if self.current_image:
            self.push_to_undo_stack()
            self.current_image = self.current_image.convert('L')
            self.update_image_display()

    def swirl_image(self):
        if self.current_image:
            self.push_to_undo_stack()
            img_array = np.array(self.current_image)
            rows, cols = img_array.shape[0], img_array.shape[1]
            center_x, center_y = rows/2, cols/2
            
            y, x = np.ogrid[:rows, :cols]
            
            dist_from_center = np.sqrt((x - center_x)**2 + (y - center_y)**2)
            
            angle = np.pi/2.0 * (dist_from_center / (np.max(dist_from_center) / 2.0))
            
            new_x = (x - center_x) * np.cos(angle) - (y - center_y) * np.sin(angle) + center_x
            new_y = (x - center_x) * np.sin(angle) + (y - center_y) * np.cos(angle) + center_y
            
            new_x = np.clip(new_x, 0, cols-1).astype(np.float32)
            new_y = np.clip(new_y, 0, rows-1).astype(np.float32)
            
            x_floor = np.floor(new_x).astype(np.int32)
            y_floor = np.floor(new_y).astype(np.int32)
            x_ceil = np.ceil(new_x).astype(np.int32)
            y_ceil = np.ceil(new_y).astype(np.int32)
            
            swirled = np.zeros_like(img_array)
            
            for i in range(rows):
                for j in range(cols):
                    if 0 <= y_floor[i,j] < rows and 0 <= x_floor[i,j] < cols:
                        swirled[i,j] = img_array[y_floor[i,j], x_floor[i,j]]
            
            self.current_image = Image.fromarray(swirled)
            self.update_image_display()

    def start_crop(self):
        if self.current_image:
            self.canvas.bind('<Button-1>', self.start_crop_selection)
            self.canvas.bind('<B1-Motion>', self.update_crop_selection)
            self.canvas.bind('<ButtonRelease-1>', self.end_crop_selection)
            self.crop_start_x = None
            self.crop_start_y = None
            self.crop_rect = None

    def start_crop_selection(self, event):
        self.crop_start_x = event.x
        self.crop_start_y = event.y
        if self.crop_rect:
            self.canvas.delete(self.crop_rect)
        self.crop_rect = self.canvas.create_rectangle(
            self.crop_start_x, self.crop_start_y,
            self.crop_start_x, self.crop_start_y,
            outline='red'
        )

    def update_crop_selection(self, event):
        if self.crop_rect:
            self.canvas.coords(
                self.crop_rect,
                self.crop_start_x, self.crop_start_y,
                event.x, event.y
            )

    def end_crop_selection(self, event):
        if self.crop_rect and self.current_image:
            self.push_to_undo_stack()
            bbox = self.canvas.coords(self.crop_rect)
            canvas_width = self.canvas.winfo_width()
            canvas_height = self.canvas.winfo_height()
            img_width, img_height = self.current_image.size
            
            scale_x = img_width / canvas_width
            scale_y = img_height / canvas_height
            
            x1 = max(0, int(min(bbox[0], bbox[2]) * scale_x))
            y1 = max(0, int(min(bbox[1], bbox[3]) * scale_y))
            x2 = min(img_width, int(max(bbox[0], bbox[2]) * scale_x))
            y2 = min(img_height, int(max(bbox[1], bbox[3]) * scale_y))
            
            self.current_image = self.current_image.crop((x1, y1, x2, y2))
            self.update_image_display()
            
            self.canvas.delete(self.crop_rect)
            self.crop_rect = None
            self.canvas.unbind('<Button-1>')
            self.canvas.unbind('<B1-Motion>')
            self.canvas.unbind('<ButtonRelease-1>')

if __name__ == "__main__":
    root = tk.Tk()
    app = ImageEditor(root)
    root.mainloop()
