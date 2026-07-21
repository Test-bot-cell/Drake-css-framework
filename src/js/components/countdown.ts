import { $, html, toFloat, trigger } from 'uikit-util';
import { defineComponent } from '../api/options';
import Class from '../mixin/class';
import type { ComponentInternalInstance } from '../types';

const units = ['days', 'hours', 'minutes', 'seconds'] as const;

type CountdownUnit = (typeof units)[number];
type TimeSpan = Record<CountdownUnit, number> & { total: number };

interface CountdownInstance extends ComponentInternalInstance {
    $props: ComponentInternalInstance['$props'] & { date: string };
    date: number;
    clsWrapper: string;
    role: string;
    reload: boolean;
    started: boolean;
    end: boolean;
    timer: number | null | undefined;
    start(): void;
    stop(): void;
    update(): void;
}

export default defineComponent<CountdownInstance>()({
    mixins: [Class],

    props: {
        date: String,
        clsWrapper: String,
        role: String,
        reload: Boolean,
    },

    data: {
        date: '',
        clsWrapper: '.uk-countdown-%unit%',
        role: 'timer',
        reload: false,
    },

    connected() {
        this.$el.role = this.role;
        this.date = toFloat(Date.parse(this.$props.date));
        this.started = this.end = false;
        this.start();
    },

    disconnected() {
        this.stop();
    },

    events: {
        name: 'visibilitychange',

        el: () => document,

        handler() {
            if (document.hidden) {
                this.stop();
            } else {
                this.start();
            }
        },
    },

    methods: {
        start() {
            this.stop();
            this.update();
        },

        stop() {
            if (this.timer) {
                clearInterval(this.timer);
                trigger(this.$el, 'countdownstop');
                this.timer = null;
            }
        },

        update() {
            const timespan = getTimeSpan(this.date);

            if (!timespan.total) {
                this.stop();
                if (!this.end) {
                    trigger(this.$el, 'countdownend');
                    this.end = true;
                    if (this.reload && this.started) {
                        window.location.reload();
                    }
                }
            } else if (!this.timer) {
                this.started = true;
                this.timer = setInterval(this.update, 1000);
                trigger(this.$el, 'countdownstart');
            }

            for (const unit of units) {
                const el = $(this.clsWrapper.replace('%unit%', unit), this.$el);

                if (!el) {
                    continue;
                }

                const digits = Math.trunc(timespan[unit]).toString().padStart(2, '0');

                if (el.textContent !== digits) {
                    const digitValues = digits.split('');

                    if (digitValues.length !== el.children.length) {
                        html(el, digitValues.map(() => '<span></span>').join(''));
                    }

                    digitValues.forEach((digit, i) => {
                        const digitElement = el.children[i];
                        if (digitElement) {
                            digitElement.textContent = digit;
                        }
                    });
                }
            }
        },
    },
});

function getTimeSpan(date: number): TimeSpan {
    const total = Math.max(0, date - Date.now()) / 1000;

    return {
        total,
        seconds: total % 60,
        minutes: (total / 60) % 60,
        hours: (total / 60 / 60) % 24,
        days: total / 60 / 60 / 24,
    };
}
