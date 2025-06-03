import { useEffect, useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import Markdown from "react-markdown";

interface HintsAccordionProps {
    hints: string[];
}

export function HintsAccordion({ hints }: HintsAccordionProps) {
    const [expandedHints, setExpandedHints] = useState<boolean[]>([]);

    useEffect(() => {
        setExpandedHints(hints.map(() => false));
    }, [hints]);

    const toggleHint = (index: number) => {
        setExpandedHints((prev) =>
            prev.map((expanded, i) => (i === index ? !expanded : expanded))
        );
    };

    return (
        <section className="space-y-0">
            <h2 className="text-2xl font-bold">Hints</h2>
            {hints.map((hint, index) => (
                <div key={index} className="border">
                    <button
                        type="button"
                        onClick={() => toggleHint(index)}
                        className="flex items-center justify-between w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 font-medium"
                    >
                        <span>Hint {index + 1}</span>
                        {expandedHints[index] ? (
                            <AiOutlineMinus className="text-xl" />
                        ) : (
                            <AiOutlinePlus className="text-xl" />
                        )}
                    </button>
                    <div
                        className={`transition-all duration-300 ease-in-out bg-white overflow-hidden text-left ${expandedHints[index]
                            ? "max-h-40 opacity-100 p-4"
                            : "max-h-0 opacity-0 p-0"
                            }`}
                    >
                        <Markdown>{hint}</Markdown>
                    </div>

                    {/* <AnimatePresence initial={false}>
                        {expandedHints[index] && (
                            <motion.div
                                key={`hint-${index}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden bg-white px-4 py-2 text-left"
                            >
                                <Markdown>{hint}</Markdown>
                            </motion.div>
                        )}
                    </AnimatePresence> */}
                </div>
            ))}
        </section>
    );
}
