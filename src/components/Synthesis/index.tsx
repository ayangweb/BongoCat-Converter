import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Form,
  Input,
} from "@heroui/react";
import mergeImages from "merge-images";
import { useEffect, useRef, useState } from "react";

const getImageDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const Synthesis = () => {
  const keyboardFileRef = useRef<HTMLInputElement>(null);
  const handFileRef = useRef<HTMLInputElement>(null);

  const [keyboardFile, setKeyboardFile] = useState<File | null>(null);
  const [handFile, setHandFile] = useState<File | null>(null);
  const [mergedImage, setMergedImage] = useState<string>("");

  useEffect(() => {
    const handleMerge = async () => {
      if (!keyboardFile || !handFile) {
        addToast({
          color: "danger",
          title: "请同时上传键盘和手部图片",
        });
        return;
      }

      try {
        const keyboardDataURL = await getImageDataURL(keyboardFile);
        const handDataURL = await getImageDataURL(handFile);

        const mergedImageData = await mergeImages([
          { src: keyboardDataURL, x: 0, y: 0 }, // TODO: 可以添加互动调整编辑位置
          { src: handDataURL, x: 0, y: 0 }, // TODO: 可以添加互动调整编辑位置
        ]);

        setMergedImage(mergedImageData);
      } catch {
        addToast({
          color: "danger",
          title: "合成图片时出错，请重试",
        });
      }
    };

    if (keyboardFile && handFile) {
      handleMerge();
    }
  }, [keyboardFile, handFile]);

  const handleKeyboardFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setKeyboardFile(file);
    }
  };

  const handleHandFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHandFile(file);
    }
  };

  const handleDownload = () => {
    if (!mergedImage) return;

    const a = document.createElement("a");
    a.href = mergedImage;
    a.download = "merged.png";
    a.click();
  };

  const handleReset = () => {
    setKeyboardFile(null);
    setHandFile(null);
    setMergedImage("");
    if (keyboardFileRef.current) {
      keyboardFileRef.current.value = "";
    }
    if (handFileRef.current) {
      handFileRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-4">
      <Form>
        <Card>
          <CardHeader>
            将部分转换存在问题的键盘与手部图片手动进行合成。
          </CardHeader>

          <Divider />

          <CardBody className="flex flex-col gap-4">
            {/* 键盘上传 */}
            <div
              className="cursor-pointer"
              onClick={() => keyboardFileRef.current?.click()}
            >
              <Input
                isRequired
                label="键盘"
                name="keyboard"
                placeholder="请选择键盘图片"
                readOnly
                value={keyboardFile?.name || ""}
              />
            </div>
            <input
              accept="image/*"
              onChange={handleKeyboardFileChange}
              ref={keyboardFileRef}
              style={{ display: "none" }}
              type="file"
            />

            {/* 手部上传 */}
            <div
              className="cursor-pointer"
              onClick={() => handFileRef.current?.click()}
            >
              <Input
                isRequired
                label="手部"
                name="hand"
                placeholder="请选择手部图片"
                readOnly
                value={handFile?.name || ""}
              />
            </div>
            <input
              accept="image/*"
              onChange={handleHandFileChange}
              ref={handFileRef}
              style={{ display: "none" }}
              type="file"
            />
          </CardBody>

          <Divider />

          <CardFooter className="flex justify-end gap-4">
            {mergedImage && (
              <Button color="primary" onPress={handleDownload} type="button">
                下载
              </Button>
            )}
            <Button color="default" onPress={handleReset} type="button">
              重置
            </Button>
          </CardFooter>
        </Card>
      </Form>

      {mergedImage && (
        <Card className="w-50">
          <CardHeader>合成结果</CardHeader>

          <CardBody>
            <img alt="merged" src={mergedImage} />
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Synthesis;
