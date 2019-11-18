import { Request, Response } from 'express';

export function redirectTo<T>(fn: (params: T) => Promise<string>) {
  return async (req: Request, res: Response) => {
    const params = {
      ...req.query,
      ...req.body,
      ...req.params,
    };

    const url = await fn(params);

    return res.redirect(url);
  };
}

export function serveStaticFile<T>(
  fn: (
    params: T,
  ) => Promise<{
    name: string;
    mime: string;
    content: Buffer;
  }>,
) {
  return async (req: Request, res: Response) => {
    const params = {
      ...req.query,
      ...req.body,
      ...req.params,
    };

    const { name, mime, content } = await fn(params);

    // res.setHeader('Content-Disposition', `attachment; filename=panda.pdf`);
    // res.setHeader('Content-Transfer-Encoding', 'binary');
    res.setHeader('Content-Type', mime);
    res.send(content);
  };
}
