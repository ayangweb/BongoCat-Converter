import { addToast, Button } from "@heroui/react";
import clsx from "clsx";
import { filesize } from "filesize";
import { Image, ImageUp, X } from "lucide-react";
import {
  type ChangeEvent,
  type DragEvent,
  type FC,
  type MouseEvent,
  useEffect,
  useState,
} from "react";

interface UploadProps {
  title: string;
  onChange?: (file?: File) => void;
}

const Upload: FC<UploadProps> = (props) => {
  const { title, onChange } = props;
  const [file, setFile] = useState<File>();
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    onChange?.(file);
  }, [file]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.currentTarget;

    if (!files) return;

    setFile(files[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();

    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();

    setIsDragOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    handleDragLeave(event);

    const { files } = event.dataTransfer;

    const file = files[0];

    if (file.type.startsWith("image/")) {
      return setFile(file);
    }

    addToast({
      color: "danger",
      title: "请上传图片文件。",
    });
  };

  const handleRemove = (event: MouseEvent) => {
    event.preventDefault();

    setFile(void 0);
  };

  return (
    <label
      className={clsx(
        "cursor-pointer rounded-xl border border-default border-dashed p-8 transition hover:border-primary",
        { "border-primary": isDragOver },
      )}
      draggable
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        type="file"
      />

      {file ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image className="size-8 text-primary" />

            <div className="flex flex-col gap-1">
              <span className="font-bold">{file.name}</span>
              <span className="text-foreground-500">{filesize(file.size)}</span>
            </div>
          </div>

          <Button
            color="danger"
            isIconOnly
            onClick={handleRemove}
            variant="light"
          >
            <X className="size-5" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <ImageUp className="size-10 text-primary" />

          <div className="font-semibold text-lg">{title}</div>

          <p className="text-foreground-500">
            单击或拖动文件到此区域进行上传。
          </p>
        </div>
      )}
    </label>
  );
};

export default Upload;
