#ifndef BASE_H
#define BASE_H

#include <stdio.h>
#include <stdarg.h>
#include <emscripten.h>

EM_JS(void, log_string, (const char* str), {
    console.log(UTF8ToString(str));
} );
class Console {
public:
    static void Log(const char* format, ...) {
        va_list args;
        va_start(args, format);
        char buffer[512];
        vsprintf(buffer, format, args);
        va_end(args);
        log_string(buffer);
    }
};


#endif // BASE_H