import { Request, Response } from 'express';

export function serveStaticFile<T>(
  fn: (
    params: T,
  ) => Promise<{
    name: string;
    mime: string;
    content: Buffer;
  }>,
) {
  return async (req: Request, res: Response): Promise<void> => {
    const params = {
      ...req.query,
      ...req.body,
      ...req.params,
    };

    try {
      const { mime, content } = await fn(params);
      // res.setHeader('Content-Disposition', `attachment; filename=panda.pdf`);
      // res.setHeader('Content-Transfer-Encoding', 'binary');
      res.setHeader('Content-Type', mime);
      res.send(content);
    } catch (e) {
      // console.error(e);
      res.status(404).end('Not found');
    }
  };
}
