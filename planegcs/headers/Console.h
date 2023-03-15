#ifndef BASE_H
#define BASE_H

#include <stdio.h>
#include <stdarg.h>

class Console {
public:
    static void Log(const char* format, ...) {
        va_list args;
        va_start(args, format);
        vprintf(format, args);
        va_end(args);
    }
};


#endif // BASE_H