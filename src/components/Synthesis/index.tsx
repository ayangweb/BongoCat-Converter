import { Button } from "@heroui/react";
import { fileSave } from "browser-fs-access";
import { Image, ImageUp } from "lucide-react";
import mergeImages from "merge-images";
import { useEffect, useState } from "react";
import { base64ToBlob } from "@/utils/binary";
import Upload from "../Upload";

const Synthesis = () => {
  const [keyboardFile, setKeyboardFile] = useState<File>();
  const [handFile, setHandFile] = useState<File>();
  const [mergeUrl, setMergeUrl] = useState<string>();

  useEffect(() => {
    if (!keyboardFile || !handFile) {
      return setMergeUrl(void 0);
    }

    const urls = [keyboardFile, handFile].map(URL.createObjectURL);

    mergeImages(urls).then(setMergeUrl);
  }, [keyboardFile, handFile]);

  const handleExport = () => {
    if (!mergeUrl) return;

    const data = base64ToBlob(mergeUrl);

    fileSave(data);
  };

  return (
    <>
      <div className="mb-6 flex gap-6">
        <div className="flex flex-1 flex-col gap-3">
          <Upload
            description="单击或拖动文件到此区域进行上传。"
            icon={ImageUp}
            onDeselect={() => setKeyboardFile(void 0)}
            onSelect={setKeyboardFile}
            selectedIcon={Image}
            selectedItem={keyboardFile}
            title="键盘图片"
          />

          <Upload
            description="单击或拖动文件到此区域进行上传。"
            icon={ImageUp}
            onDeselect={() => setHandFile(void 0)}
            onSelect={setHandFile}
            selectedIcon={Image}
            selectedItem={handFile}
            title="手部图片"
          />
        </div>

        <div className="relative flex flex-1 items-center justify-center rounded-xl bg-foreground-100">
          {mergeUrl ? (
            <img
              alt="合成的图片"
              className="absolute size-full object-contain"
              src={mergeUrl}
            />
          ) : (
            <Image className="size-12 text-foreground-400" />
          )}
        </div>
      </div>

      <Button
        color="primary"
        isDisabled={!keyboardFile || !handFile}
        onPress={handleExport}
        size="lg"
      >
        导出
      </Button>
    </>
  );
};

export default Synthesis;
