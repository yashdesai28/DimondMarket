import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMetadata, updateMetadata, type GlobalMetadataConfig, type MetadataTag } from '../../api/metadata.api';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Settings2, Plus, GripVertical, Trash2, EyeOff, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS: { key: keyof GlobalMetadataConfig; title: string; desc: string }[] = [
    { key: 'shapes', title: 'Diamond Shapes', desc: 'Standard diamond shapes (Round, Pear, etc.)' },
    { key: 'caratRanges', title: 'Carat Ranges', desc: 'Pre-defined weight bands for retail filters' },
    { key: 'colors', title: 'Color Grades', desc: 'D through Z color classifications' },
    { key: 'clarities', title: 'Clarity Grades', desc: 'IF to I3 clarity classifications' },
    { key: 'cutGrades', title: 'Cut Quality', desc: 'Light performance (EX, VG, G, F, P)' },
    { key: 'polishGrades', title: 'Polish Quality', desc: 'Surface smoothness grade' },
    { key: 'symmetryGrades', title: 'Symmetry Quality', desc: 'Proportional balance grade' },
    { key: 'labs', title: 'Certification Labs', desc: 'GIA, IGI, HRD, etc.' },
    { key: 'origins', title: 'Origin & Ethics', desc: 'Natural, Lab, Recycled, Conflict-free' },
    { key: 'marketingTags', title: 'Collection Tags', desc: 'Bridal, Investment, Solitaire' },
    { key: 'availabilityTags', title: 'Status Codes', desc: 'In Stock, Memo, Sold, Hold' },
    { key: 'shades', title: 'Visual Shades', desc: 'N, VLB, BT, LB, OB' },
    { key: 'lusters', title: 'Luster Codes', desc: 'ML1, ML2, EX, VG' },
];

export default function MetadataManager() {
    const queryClient = useQueryClient();
    const { data: metadata, isLoading } = useQuery({
        queryKey: ['metadata'],
        queryFn: fetchMetadata,
    });

    const [config, setConfig] = useState<GlobalMetadataConfig>({});
    // Store localized draft inputs for new items: { sectionKey: { code: '', label: '', desc: '' } }
    const [draftInputs, setDraftInputs] = useState<Record<string, Partial<MetadataTag>>>({});

    useEffect(() => {
        if (metadata?.config) {
            setConfig(metadata.config);
        }
    }, [metadata]);

    const mutation = useMutation({
        mutationFn: updateMetadata,
        onSuccess: () => {
            toast.success('Metadata options saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['metadata'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to save metadata');
        },
    });

    const handleSave = () => {
        mutation.mutate({ config });
    };

    const handleAddItem = (sectionKey: keyof GlobalMetadataConfig) => {
        const draft = draftInputs[sectionKey];
        if (!draft?.code || !draft?.label) {
            toast.error('Code and Label are required.');
            return;
        }

        const currentList = config[sectionKey] || [];
        if (currentList.some((t) => t.code.toUpperCase() === draft.code?.toUpperCase())) {
            toast.error(`Code ${draft.code} already exists in this section.`);
            return;
        }

        setConfig({
            ...config,
            [sectionKey]: [
                ...currentList,
                {
                    code: draft.code.toUpperCase().trim(),
                    label: draft.label.trim(),
                    description: draft.description?.trim() || undefined,
                    disabled: false,
                },
            ],
        });

        // Reset draft for this section
        setDraftInputs({ ...draftInputs, [sectionKey]: { code: '', label: '', description: '' } });
    };

    const toggleHideItem = (sectionKey: keyof GlobalMetadataConfig, index: number) => {
        const currentList = [...(config[sectionKey] || [])];
        currentList[index].disabled = !currentList[index].disabled;
        setConfig({ ...config, [sectionKey]: currentList });
    };

    const removeItem = (sectionKey: keyof GlobalMetadataConfig, index: number) => {
        if (!window.confirm('Are you sure you want to permanently delete this tag? (Hiding it is usually safer for legacy data)')) return;
        const currentList = [...(config[sectionKey] || [])];
        currentList.splice(index, 1);
        setConfig({ ...config, [sectionKey]: currentList });
    };

    const updateDraft = (sectionKey: string, field: keyof MetadataTag, value: string) => {
        setDraftInputs({
            ...draftInputs,
            [sectionKey]: { ...(draftInputs[sectionKey] || {}), [field]: value },
        });
    };

    const handleSeedDefaults = () => {
        if (!window.confirm('This will append real industry standard data (GIA colors, clarities, etc.) to your current configuration. Continue?')) return;

        const seeds: GlobalMetadataConfig = {
            shapes: [
                { code: 'RB', label: 'Round Brilliant' },
                { code: 'OV', label: 'Oval' },
                { code: 'PR', label: 'Princess' },
                { code: 'PS', label: 'Pear' },
                { code: 'EM', label: 'Emerald' },
                { code: 'CU', label: 'Cushion' },
                { code: 'MQ', label: 'Marquise' },
                { code: 'HS', label: 'Heart' },
                { code: 'RD', label: 'Radiant' },
            ],
            colors: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'].map(c => ({ code: c, label: c })),
            clarities: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'].map(c => ({ code: c, label: c })),
            cutGrades: ['EX', 'VG', 'G', 'F', 'P'].map(c => ({ code: c, label: c })),
            polishGrades: ['EX', 'VG', 'G', 'F', 'P'].map(c => ({ code: c, label: c })),
            symmetryGrades: ['EX', 'VG', 'G', 'F', 'P'].map(c => ({ code: c, label: c })),
            labs: [
                { code: 'GIA', label: 'GIA' },
                { code: 'IGI', label: 'IGI' },
                { code: 'HRD', label: 'HRD' }
            ],
            caratRanges: [
                { code: '0.01-0.29', label: '0.01-0.29 ct' },
                { code: '0.30-0.49', label: '0.30-0.49 ct' },
                { code: '0.50-0.69', label: '0.50-0.69 ct' },
                { code: '0.70-0.99', label: '0.70-0.99 ct' },
                { code: '1.00-1.49', label: '1.00-1.49 ct' },
                { code: '1.50-1.99', label: '1.50-1.99 ct' },
                { code: '2.00-2.99', label: '2.00-2.99 ct' },
                { code: '3.00+', label: '3.00+ ct' },
            ],
            availabilityTags: [
                { code: 'AVAILABLE', label: 'In Stock' },
                { code: 'HOLD', label: 'On Memo-Hold' },
                { code: 'SOLD', label: 'Sold Out' },
            ]
        };

        const newConfig = { ...config };
        Object.keys(seeds).forEach((k) => {
            const key = k as keyof GlobalMetadataConfig;
            const currentItems = newConfig[key] || [];
            const seedItems = seeds[key] || [];

            // Merge only if code doesn't exist
            seedItems.forEach(item => {
                if (!currentItems.some(ci => ci.code === item.code)) {
                    currentItems.push(item);
                }
            });
            newConfig[key] = currentItems;
        });

        setConfig(newConfig);
        toast.success('Real industry data prepared! Don\'t forget to Save Configuration.');
    };

    if (isLoading) return <div className="p-8">Loading metadata settings...</div>;

    return (
        <div className="p-8 h-full bg-zinc-50/50 text-zinc-900 overflow-y-auto">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl border border-zinc-200 shadow-sm sticky top-0 z-10">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Metadata</h1>
                    <p className="text-zinc-500 mt-1">Manage all global dropdown tags and classifications used across the platform.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleSeedDefaults} className="border-zinc-200">
                        <Plus className="mr-2 h-4 w-4" />
                        Seed Real Data
                    </Button>
                    <Button onClick={handleSave} disabled={mutation.isPending} className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[140px]">
                        <Settings2 className="mr-2 h-4 w-4" />
                        {mutation.isPending ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                {SECTIONS.map(({ key, title, desc }) => {
                    const items = config[key] || [];
                    const draft = draftInputs[key] || { code: '', label: '', description: '' };

                    return (
                        <Card key={key} className="bg-white border-zinc-200 shadow-sm flex flex-col">
                            <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50 rounded-t-xl">
                                <CardTitle className="text-lg text-zinc-800">{title}</CardTitle>
                                <CardDescription className="text-xs">{desc}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 flex flex-col">
                                <div className="flex-1 max-h-[300px] overflow-y-auto p-4 space-y-2">
                                    {items.map((item, idx) => (
                                        <div key={item.code} className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-opacity ${item.disabled ? 'bg-zinc-50 border-zinc-200 opacity-60' : 'bg-white border-zinc-200'}`}>
                                            <GripVertical className="h-4 w-4 text-zinc-300 mt-0.5 cursor-grab" />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded">
                                                        {item.code}
                                                    </span>
                                                    <span className={`font-medium ${item.disabled && 'line-through'}`}>{item.label}</span>
                                                </div>
                                                {item.description && (
                                                    <p className="text-zinc-500 text-xs mt-1">{item.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-900" onClick={() => toggleHideItem(key, idx)} title={item.disabled ? 'Enable Tag' : 'Disable Tag'}>
                                                    {item.disabled ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </Button>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-500" onClick={() => removeItem(key, idx)} title="Delete Tag permanently">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="text-center py-8 text-zinc-400 text-sm italic">
                                            No tags configured yet.
                                        </div>
                                    )}
                                </div>

                                {/* Add New Form */}
                                <div className="p-4 border-t border-zinc-100 bg-zinc-50/50 rounded-b-xl space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            placeholder="Code (e.g. EX)"
                                            value={draft.code}
                                            onChange={(e) => updateDraft(key, 'code', e.target.value)}
                                            className="h-8 text-sm font-mono"
                                        />
                                        <Input
                                            placeholder="Label (e.g. Excellent)"
                                            value={draft.label}
                                            onChange={(e) => updateDraft(key, 'label', e.target.value)}
                                            className="col-span-2 h-8 text-sm"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Optional tooltip/description..."
                                            value={draft.description}
                                            onChange={(e) => updateDraft(key, 'description', e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddItem(key);
                                                }
                                            }}
                                            className="h-8 text-sm flex-1"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleAddItem(key)}
                                            className="h-8 px-3 bg-zinc-900 text-white hover:bg-zinc-800"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
