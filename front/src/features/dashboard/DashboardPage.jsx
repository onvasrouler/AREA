import { Button } from "../../components/ui/button"

export function DashboardPage() {
    return (
        <div className="flex flex-col min-h-screen w-screen justify-center items-center bg-gray-100">
            <div className="flex flex-row w-full justify-center items-center gap-2 mt-4">
                <Button
                    className="w-full h-[50vh] ml-2"
                >
                    Service 1
                </Button>
                <Button
                    className="w-full h-[50vh]"
                >
                    Service 2
                </Button>
                <Button
                    className="w-full h-[50vh] mr-2"
                >
                    Service 3
                </Button>
            </div>
            <div className="flex flex-row w-full justify-center items-center gap-2 mt-2 mb-4">
                <Button
                    className="w-full h-[50vh] ml-2"
                >
                    Service 4
                </Button>
                <Button
                    className="w-full h-[50vh] mr-2"
                >
                    Service 5
                </Button>
            </div>
        </div>
        
    );
};