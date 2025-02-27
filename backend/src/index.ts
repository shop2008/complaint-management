import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { requestLogger } from "./middleware/logger";
import usersRouter from "./routes/users";
import complaintsRouter from "./routes/complaints";
import feedbackRouter from "./routes/feedback";
import complaintUpdatesRouter from "./routes/complaintUpdates";
import attachmentsRouter from "./routes/attachments";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Add the logger middleware before the routes
app.use(requestLogger);

app.use("/api/users", usersRouter);
app.use("/api/complaints", complaintsRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/updates", complaintUpdatesRouter);
app.use("/api/attachments", attachmentsRouter);

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  }
);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
