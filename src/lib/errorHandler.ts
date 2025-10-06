import { toast } from "@/hooks/use-toast";

export type ErrorType = 
  | "network"
  | "validation"
  | "authentication"
  | "authorization"
  | "database"
  | "unknown";

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  code?: string;
}

export class ErrorHandler {
  static handle(error: unknown, customMessage?: string): AppError {
    let appError: AppError;

    if (error instanceof Error) {
      appError = this.parseError(error);
    } else if (typeof error === "string") {
      appError = {
        type: "unknown",
        message: error
      };
    } else {
      appError = {
        type: "unknown",
        message: "Ocorreu um erro inesperado"
      };
    }

    const displayMessage = customMessage || appError.message;

    toast({
      title: this.getErrorTitle(appError.type),
      description: displayMessage,
      variant: "destructive"
    });

    console.error("Error handled:", appError);
    return appError;
  }

  private static parseError(error: Error): AppError {
    const message = error.message.toLowerCase();

    if (message.includes("network") || message.includes("fetch")) {
      return {
        type: "network",
        message: "Erro de conexão. Verifique sua internet.",
        details: error.message
      };
    }

    if (message.includes("validation") || message.includes("invalid")) {
      return {
        type: "validation",
        message: "Dados inválidos. Verifique os campos.",
        details: error.message
      };
    }

    if (message.includes("auth") || message.includes("unauthorized")) {
      return {
        type: "authentication",
        message: "Sessão expirada. Faça login novamente.",
        details: error.message
      };
    }

    if (message.includes("permission") || message.includes("forbidden")) {
      return {
        type: "authorization",
        message: "Você não tem permissão para esta ação.",
        details: error.message
      };
    }

    if (message.includes("database") || message.includes("query")) {
      return {
        type: "database",
        message: "Erro ao acessar dados. Tente novamente.",
        details: error.message
      };
    }

    return {
      type: "unknown",
      message: error.message || "Ocorreu um erro inesperado",
      details: error.stack
    };
  }

  private static getErrorTitle(type: ErrorType): string {
    const titles: Record<ErrorType, string> = {
      network: "Erro de Conexão",
      validation: "Dados Inválidos",
      authentication: "Erro de Autenticação",
      authorization: "Sem Permissão",
      database: "Erro no Sistema",
      unknown: "Erro"
    };

    return titles[type];
  }

  static success(message: string, description?: string) {
    toast({
      title: message,
      description,
    });
  }

  static info(message: string, description?: string) {
    toast({
      title: message,
      description,
    });
  }

  static warning(message: string, description?: string) {
    toast({
      title: message,
      description,
      variant: "destructive"
    });
  }
}
