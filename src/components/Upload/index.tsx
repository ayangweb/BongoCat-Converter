import { addToast, Button } from "@heroui/react";
import clsx from "clsx";
import { filesize } from "filesize";
import { X } from "lucide-react";
import type {
  ChangeEvent,
  DragEvent,
  ElementType,
  FC,
  MouseEvent,
} from "react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface SelectedItem {
  name: string;
  size: number;
}

interface ClassNames {
  root?: string;
}

interface UploadProps {
  icon: ElementType;
  title?: string;
  description?: string;
  draggable?: boolean;
  selectedItem?: SelectedItem;
  selectedIcon?: ElementType;
  classNames?: ClassNames;
  onPress?: () => void;
  onSelect?: (file?: File) => void;
  onDeselect?: () => void;
}

const Upload: FC<UploadProps> = (props) => {
  const {
    icon: Icon,
    title,
    description,
    draggable = true,
    selectedIcon: SelectedIcon,
    selectedItem,
    classNames,
    onPress,
    onSelect,
    onDeselect,
  } = props;
  const [isDragOver, setIsDragOver] = useState(false);

  const handlePress = (event: MouseEvent) => {
    if (!onPress) return;

    event.preventDefault();

    onPress();
  };

  const handleSelect = (event: ChangeEvent<HTMLInputElement>) => {
    onSelect?.(event.currentTarget.files?.[0]);

    event.currentTarget.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    if (!draggable) return;

    event.preventDefault();

    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    if (!draggable) return;

    event.preventDefault();

    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    if (!draggable) return;

    handleDragLeave(event);

    const { files } = event.dataTransfer;

    const [file] = files;

    if (file.type.startsWith("image/")) {
      return onSelect?.(file);
    }

    addToast({
      color: "danger",
      title: "请选择图片文件。",
    });
  };

  const handleDeselect = (event: MouseEvent) => {
    event.preventDefault();

    onDeselect?.();
  };

  return (
    <label
      className={clsx(
        twMerge(
          "cursor-pointer rounded-xl border border-default p-8 transition hover:border-primary hover:bg-primary-50",
          classNames?.root,
        ),
        [draggable ? "border-dashed" : "border-solid"],
        { "border-primary bg-primary-50": isDragOver },
      )}
      onClick={handlePress}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        accept="image/*"
        className="hidden"
        onChange={handleSelect}
        type="file"
      />

      {selectedItem ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {SelectedIcon && <SelectedIcon className="size-8 text-primary" />}

            <div className="flex flex-col gap-1">
              <span className="font-bold">{selectedItem.name}</span>
              <span className="text-foreground-500">
                {filesize(selectedItem.size)}
              </span>
            </div>
          </div>

          <Button
            color="danger"
            isIconOnly
            onClick={handleDeselect}
            variant="light"
          >
            <X className="size-5" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <Icon className="size-10 text-primary" />

          <div className="font-semibold text-lg">{title}</div>

          <p className="text-foreground-500">{description}</p>
        </div>
      )}
    </label>
  );
};

export default Upload;
