
/*global React */

export default function TaskToDo(props) {

    const {
        item,
    } = props;

    const number = React.useMemo(() => {
        const NumberForm = new Intl.NumberFormat(undefined, {
            style: 'decimal',
            minimumIntegerDigits: 1,
            minimumFractionDigits: 1,
        });

        const state = item.data.State;
        const estimate = item.data.Estimate;
        const toDo = item.data.ToDo;

        let formatClass = '';

        if (state !== 'Defined' && estimate === toDo) {
            formatClass = 'bad-todo';
        }

        return (
            <div className={formatClass}>
                {NumberForm.format(toDo)}
            </div>
        );
    }, [item.data.ToDo, item.data.Estimate, item.data.State]);

    return number;
}
