import * as vscode from "vscode";
import fs from "fs";
import { logger } from "./utils/logger";
import { getFileInfo, parseFunctionOrClass } from "recast-babel-ts-helper";
import path from "path";
import { fillInStoryTemplate } from "./utils/fill-in-story-template";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "add-story" is now active!');

  const disposable = vscode.commands.registerCommand(
    "add-story.add",
    async (commandInfo) => {
      logger().log("Start!");
      try {
        const filePath = commandInfo.fsPath;
        const { text, fileName, fileExtension, dir } = await getFileInfo(
          filePath
        );

        const results = parseFunctionOrClass(text);

        for (const { name, parameters, isDefault } of results) {
          const template = fs.readFileSync(
            `${__dirname}/templates/standard.txt`,
            "utf8"
          );

          const pureFileName = fileName.split(".")[0];
          const importFilePath = `./${pureFileName}`;
          const templateParameters = [
            ["$componentName", name],
            ["$componentPath", importFilePath],
          ];

          const content = fillInStoryTemplate(template, templateParameters);
          const workspaceEdit = new vscode.WorkspaceEdit();

          const newFilePath = vscode.Uri.file(
            path.join(
              dir,
              `${
                results.length > 1 ? name : pureFileName
              }.stories.${fileExtension}`
            )
          );
          workspaceEdit.createFile(newFilePath);

          workspaceEdit.insert(newFilePath, new vscode.Position(0, 0), content);
          await vscode.workspace.applyEdit(workspaceEdit);

          const doc = await vscode.workspace.openTextDocument(newFilePath);
          vscode.window.showTextDocument(doc);
        }
      } catch (error: any) {
        logger().error(error);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
