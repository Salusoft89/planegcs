#include <iostream>
#include <vector>
#include "GCS.h"

using namespace GCS;
using namespace std;

// wrapper class
class GcsSystem : System
{
    public:
        vector<double *> params;
        vector<bool> is_fixed;
        DebugMode debug_mode;

        GcsSystem() : System() {
            params = vector<double *>();
            is_fixed = vector<bool>();
            debug_mode = DebugMode::NoDebug;
        }

        int params_size()
        {
            return params.size();
        }

        double get_param(int i)
        {
            return *params[i];
        }

        void set_param(int i, double value, bool fixed)
        {
            *params[i] = value;
            is_fixed[i] = fixed;
        }

        void push_param(double value, bool fixed)
        {
            params.push_back(new double(value));
            is_fixed.push_back(fixed);
        }

        bool get_is_fixed(int i)
        {
            return is_fixed[i];
        }

        int solve_system()
        {
            vector<double *> solved_params;
            for (int i = 0; i < params.size(); ++i)
            {
                if (!is_fixed[i])
                {
                    solved_params.push_back(params[i]);
                }
            }
            return solve(solved_params);
        }

        vector<double> get_params()
        {
            vector<double> p;
            for (int i = 0; i < params.size(); ++i)
            {
                p.push_back(*params[i]);
            }
            return p;
        }

        vector<int> get_conflicting()
        {
            vector<int> conflicting;
            getConflicting(conflicting);
            return conflicting;
        }

        void clear()
        {
            for (int i = 0; i < params.size(); ++i)
            {
                delete params[i];
            }
            params.clear();
            is_fixed.clear();
            clear();
        }

        void apply_solution()
        {
            applySolution();
        }

        int dof()
        {
            return dofsNumber();
        }

        bool has_conflicting()
        {
            return hasConflicting();
        }

        bool has_redundant()
        {
            return hasRedundant();
        }

        void clear_by_id(int id)
        {
            clearByTag(id);
        }

        void set_debug_mode(DebugMode debug_mode)
        {
            this->debug_mode = debug_mode;
        }

    private:
        inline Point make_point(int px_i, int py_i)
        {
            Point p;
            p.x = params[px_i];
            p.y = params[py_i];
            return p;
        }

        inline Line make_line(int p1x_i, int p1y_i, int p2x_i, int p2y_i)
        {
            Point p1 = make_point(p1x_i, p1y_i);
            Point p2 = make_point(p2x_i, p2y_i);

            Line l;
            l.p1 = p1;
            l.p2 = p2;

            return l;
        }

        inline Circle make_circle(int cx_i, int cy_i, int rad_i)
        {
            Point cp = make_point(cx_i, cy_i);

            Circle c;
            c.center = cp;
            c.rad = params[rad_i];

            return c;
        }

        inline Arc make_arc(
            int cx_i, int cy_i, int startx_i, int starty_i, int endx_i, int endy_i,
            int startangle_i, int endangle_i, int rad_i)
        {
            Point c = make_point(cx_i, cy_i);
            Point start = make_point(startx_i, starty_i);
            Point end = make_point(endx_i, endy_i);

            Arc a;
            a.center = c;
            a.start = start;
            a.startAngle = params[startangle_i];
            a.endAngle = params[endangle_i];
            a.end = end;
            a.rad = params[rad_i];

            return a;
        }

    public:
        void add_constraint_difference(
            /* object-param */
            int x_i,
            /* object-param */
            int y_i,
            /* fixed-param */
            int difference_i, int id)
        {
            addConstraintDifference(params[x_i], params[y_i], params[difference_i], id);
        }

        void add_constraint_equal(
            /* object-param */
            int x_i,
            /* fixed-param */
            int value_i, int id)
        {
            addConstraintEqual(params[x_i], params[value_i], id);
        }

        void add_constraint_arc_rules(
            /* arc */
            int cx_i, int cy_i, int startx_i, int starty_i, int endx_i, int endy_i,
            int startangle_i, int endangle_i, int rad_i, int id)
        {
            Arc a = make_arc(cx_i, cy_i, startx_i, starty_i, endx_i, endy_i, startangle_i, endangle_i, rad_i);
            addConstraintArcRules(a, id);
        }

        void add_constraint_angle_via_point_line_arc(
            /* line */
            int p1x_i, int p1y_i, int p2x_i, int p2y_i,
            /* arc */
            int cx_i, int cy_i, int startx_i, int starty_i, int endx_i, int endy_i,
            int startangle_i, int endangle_i, int rad_i,
            /* point */
            int px_i, int py_i,
            /* fixed-param */
            int angle_i, int id)
        {
            Line l = make_line(p1x_i, p1y_i, p2x_i, p2y_i);
            Arc a = make_arc(cx_i, cy_i, startx_i, starty_i, endx_i, endy_i, startangle_i, endangle_i, rad_i);
            Point p = make_point(px_i, py_i);

            addConstraintAngleViaPoint(l, a, p, params[angle_i], id);
        }

        void add_constraint_angle_via_point_arc_arc(
            /* arc */
            int c1x_i, int c1y_i, int start1x_i, int start1y_i, int end1x_i, int end1y_i,
            int startangle1_i, int endangle1_i, int rad1_i,
            /* arc */
            int c2x_i, int c2y_i, int start2x_i, int start2y_i, int end2x_i, int end2y_i,
            int startangle2_i, int endangle2_i, int rad2_i,
            /* point */
            int px_i, int py_i,
            /* fixed-param */
            int angle_i, int id)
        {
            Arc a1 = make_arc(c1x_i, c1y_i, start1x_i, start1y_i, end1x_i, end1y_i, startangle1_i, endangle1_i, rad1_i);
            Arc a2 = make_arc(c2x_i, c2y_i, start2x_i, start2y_i, end2x_i, end2y_i, startangle2_i, endangle2_i, rad2_i);
            Point p = make_point(px_i, py_i);

            addConstraintAngleViaPoint(a1, a2, p, params[angle_i], id);
        }

        void add_constraint_equal_length(
            /* line */
            int l1p1x_i, int l1p1y_i, int l1p2x_i, int l1p2y_i,
            /* line */
            int l2p1x_i, int l2p1y_i, int l2p2x_i, int l2p2y_i,
            int id)
        {
            Line l1 = make_line(l1p1x_i, l1p1y_i, l1p2x_i, l1p2y_i);
            Line l2 = make_line(l2p1x_i, l2p1y_i, l2p2x_i, l2p2y_i);

            addConstraintEqualLength(l1, l2, id);
        }

        void add_constraint_p2p_coincident(
            /* point */
            int p1x_i, int p1y_i,
            /* point */
            int p2x_i, int p2y_i, int id)
        {
            Point p1 = make_point(p1x_i, p1y_i);
            Point p2 = make_point(p2x_i, p2y_i);

            addConstraintP2PCoincident(p1, p2, id);
        }

        void add_constraint_p2p_distance(
            /* point */
            int p1x_i, int p1y_i,
            /* point */
            int p2x_i, int p2y_i,
            /* fixed-param */
            int distance_i, int id)
        {
            Point p1 = make_point(p1x_i, p1y_i);
            Point p2 = make_point(p2x_i, p2y_i);

            addConstraintP2PDistance(p1, p2, params[distance_i], id);
        }
};


#include <emscripten/bind.h>  
// using namespace emscripten;

EMSCRIPTEN_BINDINGS(module) {
    emscripten::register_vector<double>("DoubleVector");
    emscripten::register_vector<int>("IntVector");

    emscripten::class_<GcsSystem>("GcsSystem")
        .constructor<>()
        .function("params_size", &GcsSystem::params_size)
        .function("get_param", &GcsSystem::get_param)
        .function("get_params", &GcsSystem::get_params)
        .function("set_param", &GcsSystem::set_param)
        .function("push_param", &GcsSystem::push_param)
        .function("get_is_fixed", &GcsSystem::get_is_fixed)
        .function("solve_system", &GcsSystem::solve_system)
        .function("get_conflicting", &GcsSystem::get_conflicting)
        .function("clear", &GcsSystem::clear)
        // // .function("set_debug_mode", &GcsSystem::set_debug_mode)
        // functions derived from GCS::System
        .function("apply_solution", &GcsSystem::apply_solution)
        .function("dof", &GcsSystem::dof)
        .function("has_conflicting", &GcsSystem::has_conflicting)
        .function("has_redundant", &GcsSystem::has_redundant)
        .function("clear_by_id", &GcsSystem::clear_by_id)
        // constraint functions
        .function("add_constraint_difference", &GcsSystem::add_constraint_difference)
        .function("add_constraint_equal", &GcsSystem::add_constraint_equal)
        .function("add_constraint_arc_rules", &GcsSystem::add_constraint_arc_rules)
        .function("add_constraint_angle_via_point_line_arc", &GcsSystem::add_constraint_angle_via_point_line_arc)
        .function("add_constraint_angle_via_point_arc_arc", &GcsSystem::add_constraint_angle_via_point_arc_arc)
        .function("add_constraint_equal_length", &GcsSystem::add_constraint_equal_length)
        .function("add_constraint_p2p_coincident", &GcsSystem::add_constraint_p2p_coincident)
        .function("add_constraint_p2p_distance", &GcsSystem::add_constraint_p2p_distance)
        ;

    // emscripten::enum_<DebugMode>("DebugMode")
    //     .value("NoDebug", NoDebug)
    //     .value("Minimal", Minimal)
    //     .value("IterationLevel", IterationLevel)
}
