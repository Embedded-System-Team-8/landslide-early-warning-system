
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatusType = 'safe' | 'warning' | 'danger';

type StatusCardProps = {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  status: StatusType;
  icon?: React.ReactNode;
};

const StatusCard = ({
  title,
  value,
  unit,
  change,
  status,
  icon,
}: StatusCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex justify-between items-center">
          <span>{title}</span>
          <div className={cn(
            "status-indicator",
            status === 'safe' && "status-safe",
            status === 'warning' && "status-warning",
            status === 'danger' && "status-danger",
          )}></div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>}
          </div>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardContent>
      {change !== undefined && (
        <CardFooter className="pt-0">
          <div className="flex items-center text-xs text-muted-foreground">
            {change > 0 ? (
              <>
                <ArrowUp className="mr-1 h-3 w-3 text-status-danger" />
                <span className="text-status-danger">+{change}%</span>
              </>
            ) : (
              <>
                <ArrowDown className="mr-1 h-3 w-3 text-status-safe" />
                <span className="text-status-safe">{change}%</span>
              </>
            )}
            <span className="ml-1">dari kemarin</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default StatusCard;
