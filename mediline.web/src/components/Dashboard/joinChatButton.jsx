const joinChatButton = ({ onClick }) => {
    return (
        <div id="join-chat-button" onClick={onClick}>
            <div className="join-chat-icon">
                <p>THE BUTTON</p>
            </div>
            <span className="join-chat-text">Join Chat</span>
        </div>
    );
}

export default joinChatButton;