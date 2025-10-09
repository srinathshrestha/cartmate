import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * AccountInfo Component
 * Displays account information including creation date, email status.
 * Keeps file size under 150 lines by focusing on display logic.
 */
export default function AccountInfo({ user }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account created</span>
                    <span className="font-medium">
                        {user && new Date(user.createdAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last updated</span>
                    <span className="font-medium">
                        {user && new Date(user.updatedAt).toLocaleDateString()}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email Status</span>
                    <span className="font-medium flex items-center gap-1">
                        {user?.isEmailVerified ? (
                            <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Verified
                            </>
                        ) : (
                            <>
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                Not Verified
                            </>
                        )}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
