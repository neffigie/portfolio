"use client";
import { Table, TableContainer, TableContainerProps, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";

export interface TableProps extends TableContainerProps {
    children: React.ReactElement<TableProps>[];
}

/**
 * Converts a table in PocketBase's HTML to a ChakraUI table.
 * @privateremarks Don't even try to generalize this to other databases
 */
export default function HTMLTable<T extends TableProps>({ children, ...props }: T) {
    const table = children[1].props.children;
    return (
        <TableContainer {...props}>
            <Table size="sm" colorScheme="accent">
                <Thead>
                    <Tr>
                        {table[0].props.children.map((x, i) => (
                            <Th key={i} color="ink.primary">{`${x.props.children}`}</Th>
                        ))}
                    </Tr>
                </Thead>
                <Tbody>
                    {[...table].slice(1).map((x, i) => (
                        <Tr key={i}>
                            {x.props.children.map((x, i) => (
                                <Td key={i} color="ink.muted">{`${x.props.children}`}</Td>
                            ))}
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    );
}
