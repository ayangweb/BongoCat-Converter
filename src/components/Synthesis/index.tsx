import { Button } from "@heroui/react";
import { fileSave } from "browser-fs-access";
import mergeImages from "merge-images";
import { useEffect, useState } from "react";
import { base64ToBlob } from "@/utils/binary";
import Upload from "./Upload";

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
          <Upload onChange={setKeyboardFile} title="键盘图片" />

          <Upload onChange={setHandFile} title="手部图片" />
        </div>

        <div className="flex flex-1 items-center justify-center rounded-xl bg-foreground-100">
          {mergeUrl ? (
            <img alt="mergeUrl" src={mergeUrl} />
          ) : (
            "上传之后预览合成的图片"
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
