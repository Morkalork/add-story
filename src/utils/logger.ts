import * as vscode from "vscode";

type Logger = {
  log: (message: string) => void;
  error: (message: string) => void;
  showErrorMessage: (message: string) => void;
  showInformationMessage: (message: string) => void;
};

let outputChannel: vscode.OutputChannel;
let _logger: Logger;

export const logger = (): Logger => {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel("Add Story");
    _logger = {
      log: (message: string) => {
        outputChannel.appendLine(message);
      },
      error: (message: string) => {
        outputChannel.appendLine(`Error: ${message}`);
      },
      showErrorMessage: (message: string) => {
        outputChannel.appendLine(`Error outputted: ${message}`); // Optional
        vscode.window.showErrorMessage(message);
      },
      showInformationMessage: (message: string) => {
        outputChannel.appendLine(`Information: ${message}`); // Optional
        vscode.window.showInformationMessage(message);
      },
    };
  }

  return _logger;
};