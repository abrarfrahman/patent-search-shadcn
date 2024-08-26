import React, { useState } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Claim, ClaimText, PatentSearchResult } from "@/data/patentDataSchema";

const ActionCell: React.FC<{ patent: PatentSearchResult }> = ({ patent }) => {
    const [data, setData] = React.useState<any>(null);
    const [selectedClaims, setSelectedClaims] = React.useState<Set<string>>(new Set());
    const [claims, setClaims] = React.useState<Claim[] | null>(null);
    const [displayData, setDisplayData] = useState<{ patent: PatentSearchResult; claims: Claim[] } | null>(null);

    const fetchClaims = async (patentId: string) => {
        try {
            const response = await fetch(`/api/claims?id=${encodeURIComponent(patentId)}`);
            const claimsData: Claim[] = await response.json();
            setClaims(claimsData);
        } catch (error) {
            console.error("Error fetching claims:", error);
        }
    };

    const validateSelection = (selected: Set<string>, claims: Claim[]): boolean => {
        const selectedClaimIds = Array.from(selected);
        const claimIdToParents = new Map<string, Set<string>>();

        // Build a map of claim IDs to their parent IDs
        claims.forEach(claim => {
            claim['claim-text'].forEach(part => {
                if (typeof part !== "string") {
                    part.nested?.forEach(nestedPart => {
                        if (typeof nestedPart !== "string") {
                            const parentId = claim.id;
                            const childId = nestedPart.text || "";

                            if (!claimIdToParents.has(childId)) {
                                claimIdToParents.set(childId, new Set());
                            }
                            claimIdToParents.get(childId)?.add(parentId);
                        }
                    });
                }
            });
        });

        // Check if all selected claims have their parents selected
        for (const claimId of selectedClaimIds) {
            if (claimIdToParents.has(claimId)) {
                const parents = claimIdToParents.get(claimId) || [];
                for (const parent of parents) {
                    if (!selected.has(parent)) {
                        return false;
                    }
                }
            }
        }

        return true;
    };

    const handleConfirmSelection = () => {
        if (selectedClaims.size === 0) {
            alert("At least one claim must be selected.");
            return;
        }

        if (!claims || !validateSelection(selectedClaims, claims)) {
            alert("Please ensure all parent claims are selected for any dependent claims.");
            return;
        }

        // Set data to be displayed on a separate screen or update UI as needed
        setDisplayData({
            patent,
            claims: claims.filter(claim => selectedClaims.has(claim.id))
        });

        // Example: console log the selected claims (could navigate to another page instead)
        console.log("Selected Patent:", patent);
        console.log("Selected Claims:", Array.from(selectedClaims));
    };

    const renderClaimText = (
        claimText: (string | ClaimText)[],
        claimId: string,
        parentId: string | null = null
    ) => {
        return claimText.map((textPart, index) => {
            const currentId = parentId ? `${parentId}-${index}` : `${claimId}-${index}`;
            console.log(`Rendering: ${currentId}, Checked: ${selectedClaims.has(currentId)}`);
    
            if (typeof textPart === "string") {
                return (
                    <div key={currentId}>
                        <label>
                            <input
                                type="checkbox"
                                checked={selectedClaims.has(currentId)}
                                onChange={(e) =>
                                    handleToggleClaim(currentId, e.target.checked)
                                }
                            />
                            {textPart}
                        </label>
                    </div>
                );
            } else {
                return (
                    <div key={currentId} style={{ marginLeft: "20px" }}>
                        {textPart.text && (
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={selectedClaims.has(currentId)}
                                        onChange={(e) =>
                                            handleToggleClaim(currentId, e.target.checked)
                                        }
                                    />
                                    {textPart.text}
                                </label>
                            </div>
                        )}
                        {textPart.nested && renderClaimText(textPart.nested, claimId, currentId)}
                    </div>
                );
            }
        });
    };       

    const handleToggleClaim = (claimId: string, isChecked: boolean) => {
        console.log(`Handling Toggle for: ${claimId}, IsChecked: ${isChecked}`);
    
        // Create a copy of the current selections
        const updatedSelections = new Set(selectedClaims);
        
        const toggleDescendants = (textParts: (string | ClaimText)[], parentId: string, shouldSelect: boolean) => {
            textParts.forEach((textPart, index) => {
                const currentId = `${parentId}-${index}`;
                console.log(`Toggling Descendant: ${currentId}, ShouldSelect: ${shouldSelect}`);
    
                if (typeof textPart === 'string') {
                    if (shouldSelect) {
                        updatedSelections.add(currentId);
                    } else {
                        updatedSelections.delete(currentId);
                    }
                } else {
                    // Use the text property as a key for ClaimText
                    if (shouldSelect) {
                        updatedSelections.add(currentId);
                    } else {
                        updatedSelections.delete(currentId);
                    }
    
                    if (textPart.nested) {
                        toggleDescendants(textPart.nested, currentId, shouldSelect);
                    }
                }
            });
        };
    
        // Toggle the claim itself
        if (isChecked) {
            updatedSelections.add(claimId);
        } else {
            updatedSelections.delete(claimId);
        }
        
        console.log(`Toggling Claim: ${claimId}, IsChecked: ${isChecked}`);
    
        // Toggle all descendants
        const claim = claims?.find(claim => claim.id === claimId);
        if (claim && claim['claim-text']) {
            toggleDescendants(claim['claim-text'], claimId, isChecked);
        }
        
        // Update the state with the new selections
        setSelectedClaims(updatedSelections);
        console.log(`Updated Selections: ${Array.from(updatedSelections)}`);
    }; 

    const handleViewMetadataClick = async () => {
        const patentId = patent?.id;

        try {
            const response = await fetch(`/api/patents/metadata?query=${encodeURIComponent(patentId)}`);
            if (response.ok) {
                const result = await response.json();
                setData(result);
            } else {
                console.error('Error fetching data:', response.statusText);
                setData(null); 
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setData(null);
        }
    };

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                
                <DropdownMenuItem
                    onClick={() => navigator.clipboard.writeText(patent.id)
                        .then(() => alert("Successfully copied"))
                        .catch(() => alert("Something went wrong"))}
                >
                    Copy Patent ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => fetchClaims(patent?.id)}
                >
                    Fetch Claims
                </DropdownMenuItem>
                {/* Render claim selection options here */}
                {claims && (
                    <div>
                        <h3>Claims</h3>
                        {claims.map(claim => (
                            <div key={claim.id}>
                                <h4>Claim {claim.num}</h4>
                                {renderClaimText(claim['claim-text'], claim.id)}
                            </div>
                        ))}
                        <Button onClick={handleConfirmSelection}>Confirm Selection</Button>
                    </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleViewMetadataClick}
                >
                    View verbose patent metadata
                </DropdownMenuItem>
                {/* Display fetched data */}
                {data && <pre className="data-display">{JSON.stringify(data, null, 2)}</pre>}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const Columns: ColumnDef<PatentSearchResult, any>[] = [
    {
        id: "select",
        cell: ({ row }) => (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: ({ column }) => (
            <Button 
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Patent ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("id") as string}</div>,
        enableSorting: true,
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <Button 
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Title
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("title") as string}</div>,
        enableSorting: true,
    },
    {
        accessorKey: "abstract",
        header: "Abstract",
        cell: ({ row }) => <div>{row.getValue("abstract") as string}</div>,
    },
    {
        accessorKey: "priority_date",
        header: ({ column }) => (
            <Button 
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Priority Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("priority_date") as string}</div>,
    },
    {
        accessorKey: "inventors",
        header: "Inventors",
        cell: ({ row }) => <div>{row.getValue("inventors") as string}</div>,
    },
    {
        accessorKey: "assignees",
        header: "Assignees",
        cell: ({ row }) => <div>{row.getValue("assignees") as string}</div>,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => <ActionCell patent={row.original} />,
    },
];
