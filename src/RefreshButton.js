export default function RefreshButton(props) {

    const {
        onClick,
    } = props;

    return (
        <div className="refresh-button-container">
            <button className="refresh-button" onClick={onClick} >↻</button>
        </div>
    );

}
