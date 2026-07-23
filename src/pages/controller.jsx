export default function Controller ({props: Component, page}) {
    return (
        <>
            <title>{page}</title>
            <Component />
        </>
    )
}