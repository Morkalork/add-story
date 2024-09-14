import * as vscode from "vscode";
import fs from "fs";
import { logger } from "./utils/logger";
import { getFileInfo, parseFunctionOrClass } from "recast-babel-ts-helper";
import path from "path";
import { fillInStoryTemplate } from "./utils/fill-in-story-template";
import { getDefaultTypeContent } from "./utils/get-default-type-content";

const createAccumulatorLine = (
  acc: string,
  paramName: string,
  paramValue: string
) => `${acc ? acc + "\n" : acc}\t\t${paramName}: ${paramValue},`;

export function activate(context: vscode.ExtensionContext) {
  // Handle the file selection for story template
  const fileDisposable = vscode.commands.registerCommand(
    "add-story.addStoryTemplatePath",
    async () => {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: "Select Template File",
        filters: {
          "Text files": ["txt"],
          "All files": ["*"],
        },
      });

      if (fileUri && fileUri[0]) {
        const selectedFile = fileUri[0].fsPath;
        const config = vscode.workspace.getConfiguration("add-story");
        config.update(
          "storyTemplatePath",
          selectedFile,
          vscode.ConfigurationTarget.Global
        );
        vscode.window.showInformationMessage(`Selected file: ${selectedFile}`);
      }
    }
  );
  context.subscriptions.push(fileDisposable);

  const disposable = vscode.commands.registerCommand(
    "add-story.add",
    async (commandInfo) => {
      logger().log("Start!");
      try {
        const settings = vscode.workspace.getConfiguration("add-story");
        const shouldAddArgsToStory = settings.get<boolean>(
          "shouldAddArgsToStory"
        );

        const storyTemplatePath = settings.get<string>("storyTemplatePath");
        const filePath = commandInfo.fsPath;
        const { text, fileName, fileExtension, dir } = await getFileInfo(
          filePath
        );

        const results = parseFunctionOrClass(text);
        const templatePath =
          storyTemplatePath || `${__dirname}/templates/standard.txt`;
        if (!fs.existsSync(templatePath)) {
          logger().error(`Template file not found: ${templatePath}`);
          return;
        }
        const template = fs.readFileSync(templatePath, "utf8");

        for (const { name, parameters } of results) {
          const pureFileName = fileName.split(".")[0];
          const importFilePath = `./${pureFileName}`;

          const templateParameters = [
            ["$componentName", name],
            ["$componentPath", importFilePath],
          ];

          const componentArgsWithTypes = parameters.reduce((acc, param) => {
            return createAccumulatorLine(
              acc,
              param.name,
              getDefaultTypeContent(param.type)
            );
          }, "");
          const componentArgsWithValues = parameters.reduce((acc, param) => {
            return createAccumulatorLine(acc, param.name, '""');
          }, "");
          templateParameters.push([
            "$componentArgsWithTypes",
            shouldAddArgsToStory ? componentArgsWithTypes.trim() : "",
          ]);
          templateParameters.push([
            "$componentArgsWithValues",
            shouldAddArgsToStory ? componentArgsWithValues.trim() : "",
          ]);

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
