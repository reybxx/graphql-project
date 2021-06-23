const mongoose = require('mongoose');
const express = require('express')
const { graphqlHTTP } = require('express-graphql');
const {buildSchema} = require('graphql');
const User = require('../Schema/user');
const Board = require('../Schema/board');
const PORT = 3003

const app = express()
app.use(express.json());
app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


const schema = buildSchema(`
"""
Inputs
"""
    input UserInput{
    firstName: String
    lastName: String
    emailAddress: String!
    password: String!
    }
    
    input BoardInput{
    owner: String!
    editors: String
    }
    
    input EditorInput {
    boardId: String
    editors: String
    }
    
    input deleteEditorInput{
    boardId: String
    editors: String
    }
    
    input PostInput{
    boardId: String
    text: String
    author: String
    x: String
    y: String
    }
    
    input deletePostInput { 
    boardId: String!           
    postId: String        
    } 
    
    input deleteBoardInput { 
    boardId: String!          
    } 
    
    input updatePostInput{
    boardId: String!
    postId: String!
    text: String
    author: String
    x: String
    y: String
    }
    
"""
Types
"""   
    type User {
    userId: String
    firstName: String
    lastName: String
    emailAddress: String
    }
    
    type Board {
    boardId: String
    owner: String
    editors: [String]
    }
    
    type Editor{
    boardId: String
    editors: String
    }
    
    type Posts{
    boardId: String
    postId: String
    text: String
    author: String
    x: String
    y: String
    }
    
    
    type deleteEditor {                       
    boardId: String 
    editors: String
    }
    
    type updatePost{
    boardId: String
    postId: String
    text: String
    author: String
    x: String
    y: String
    }
    
    type deletePost {      
    boardId: String                 
    postId: String 
    }
    
    type deleteBoard {            
    boardId: String  
    }
    
    type Query {
     userById(userId:String!): User
     boardById(boardId:String!): Board
    }    
        
    type Mutation{
    createUser(user: UserInput): User
    createBoard(board: BoardInput): Board 
    addEditor(editors: EditorInput): Editor   
    createPost(posts: PostInput): Posts
    updatePost(posts: updatePostInput): Posts
    deleteEditor(editors: deleteEditorInput): Editor
    deletePost(posts: deletePostInput): Posts
    deleteBoard(board: deleteBoardInput): Board
    }
`);

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: {

        //User

        async userById({userId}){
            const user = await User.findById(userId);
            return user;
        },
        async createUser({user}){
            const model= new User(user);
            await model.save();
            return model;
        },
        async addEditor({editors}){
            const board = await Board.findOne({_id: editors.boardId});
            board.editors.push(editors.editors);
            await board.save();
            return(editors);
        },
        async deleteEditor({editors}){
            const deletedEditor= await Board.updateOne(
                {_id: editors.boardId},
                { $pull: {editors: editors.editors } })
            console.log(deletedEditor);
            return(editors);
        },

        //Board

        async boardById({boardId}) {
            const board = await Board.findById(boardId);
            return board;
        },
        async createBoard({board}) {
            const model = new Board(board);
            await model.save();
            return model;
        },
        async deleteBoard({board}) {
            const deletedBoard =
                await Board.remove({_id: board.boardId});
            console.log(deletedBoard);
            return (board);
        },

        //Post

        async createPost({posts}){
            const board = await Board.findOne({_id: posts.boardId});
            board.posts.push(posts);
            await board.save();
            return(posts);
        },
        async updatePost({posts}){
            const updatedPost = await Board.findOneAndUpdate(
                {_id: posts.boardId, "posts._id": posts.postId},
                {$set: {"posts.$.text": posts.text, "posts.$.x" : posts.x, "posts.$.y" : posts.y}})
            console.log(updatedPost);
            return(posts);
        },
        async deletePost({posts}) {
            const deletedPost= await Board.updateOne(
                {_id: posts.boardId},
                {$pull: {posts: {_id: posts.postId}}});
            console.log(deletedPost);
            return(posts);
        },
    },
    graphiql: true,
}));


mongoose.connect('mongodb://localhost:27019', {
    user: 'root',
    pass: 'example',
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}, error => {
    if(!error) {
        app.listen(PORT, () => {
            console.log(`Example app listening at http://localhost:${PORT}`)
        })
    } else {
        console.error('Failed to open a connection to mongo db.', error);
    }
});