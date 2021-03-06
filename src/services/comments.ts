import { insertData, executeQuery, deleteData, updateData } from '../utils/sqliteUtils';
import { mapKeys } from '../utils/objectUtils';
import { UserBriefInfo } from './users';
import { globalMap } from '../config/globalMap';

type NewComment = {
    userId: number,
    albumId: number,
    content: string
};

type Comment = UserBriefInfo & NewComment & {
    commentId: number,
    commentTime: string
};

// 用于提醒用户的未读评论通知
type CommentNotification = UserBriefInfo & NewComment & {
    albumName: string,
    commentTime: string,
    commentId: number,
    hasRead: number
};

const objectToDataMap = globalMap;

export function addNewComment(newComment: NewComment) {
    return insertData('comments', mapKeys(newComment, objectToDataMap));
}

export function deleteComment(commentId: number) {
    return deleteData('comments', { comid: commentId });
}

export function getComments(albumId: number): Promise<Comment[]> {
    const sqlStr = `SELECT c.*, u.avatar_url, u.uname, u.gender, u.identity, u.rid, r.rname
                    FROM comments c
                        JOIN users u ON c.uid = u.uid
                        LEFT JOIN regions r ON u.rid = r.rid
                    WHERE c.aid = ? 
                    ORDER BY c.comment_time ASC`;
    return executeQuery(sqlStr, [albumId])
        .then(rows => (<any[]>rows).map(row => <Comment>mapKeys(row, objectToDataMap, true)));
}

export function getUnreadComments(userId: number): Promise<CommentNotification[]> {
    const sqlStr = `SELECT c.*, u.avatar_url, u.uname, u.gender, u.identity, u.rid, a.aname, r.rname
                    FROM comments c
                        JOIN users u ON c.uid = u.uid
                        JOIN albums a ON a.aid = c.aid
                        LEFT JOIN regions r ON u.rid = r.rid
                    WHERE a.uid = ? AND c.has_read = 0
                    ORDER BY c.comment_time DESC`;
    return executeQuery(sqlStr, [userId])
        .then(rows => (<any[]>rows).map(row => <CommentNotification>mapKeys(row, objectToDataMap, true)));
}

export function setCommentRead(commentId: number) {
    return updateData('comments', ['comid'], { comid: commentId, has_read: 1 });
}