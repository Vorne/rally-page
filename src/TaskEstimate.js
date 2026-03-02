
/*global React */

export default function TaskEstimate(props) {

    const {
        item,
    } = props;

    const number = React.useMemo(() => {
        const NumberForm = new Intl.NumberFormat(undefined, {
            style: 'decimal',
            minimumIntegerDigits: 1,
            minimumFractionDigits: 1,
        });

        return (
            <div>
                {NumberForm.format(item.data.Estimate)}
            </div>
        );
    }, [item.data.Estimate]);

    return number;
}
