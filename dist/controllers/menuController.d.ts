import { Request, Response } from 'express';
export declare const getTodayMenu: (req: Request, res: Response) => Promise<void>;
export declare const getTodayVeganMenu: (req: Request, res: Response) => Promise<void>;
export declare const getMenuByDate: (req: Request, res: Response) => Promise<void>;
export declare const getMenuStats: (req: Request, res: Response) => Promise<void>;
export declare const getMenuByDateRange: (req: Request, res: Response) => Promise<void>;
export declare const getWeeklyMenu: (req: Request, res: Response) => Promise<void>;
export declare const updateMenuItemPrice: (req: Request, res: Response) => Promise<void>;
export declare const resetMenuItemPrice: (req: Request, res: Response) => Promise<void>;
export declare const bulkAddToMenu: (req: Request, res: Response) => Promise<void>;
export declare const getAvailableMenuDates: (req: Request, res: Response) => Promise<void>;
export declare const addToMenu: (req: Request, res: Response) => Promise<void>;
export declare const removeFromMenu: (req: Request, res: Response) => Promise<void>;
export declare const clearMenuForDate: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=menuController.d.ts.map