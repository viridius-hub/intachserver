import ILesson from "../../../interfaces/ILesson";
import { DateTime } from "luxon";
import { ApiParser } from "../ApiParser";

export class ChgpgtParser extends ApiParser {

    constructor () {
        super('https://api.chgpgt.ru/api/', { weeks: true, teacherMode: true })
    }

    public readonly groups = async (): Promise<object[]> => {
        return [
            { name: '01', },
            { name: '02', },
            { name: '03', },
            { name: '04', },
            { name: '05', },
            { name: '06', },
            { name: '07', },
            { name: '107', },
            { name: '207', },
            { name: '307', },
            { name: '407', },
            { name: '108-ТПИ', },
            { name: '106-ОМД', },
        ]
    }

    public readonly lessonsWeek = async (params: { group: string, week?: number }): Promise<ILesson[]> => {
        const array: ILesson[] = []
        const offset = params.week
        let local = DateTime.local().setZone('Asia/Yekaterinburg').setLocale('ru-RU').set({ weekday: 1 }).startOf('day')

        if ( offset && offset > 0 ) {
            local = DateTime.local().setZone('Asia/Yekaterinburg').setLocale('ru-RU').set({ weekday: 1 }).startOf('day')
            .plus({ days: 7 * offset })
        }
        else if ( offset && offset < 0 ) {
            local = DateTime.local().setZone('Asia/Yekaterinburg').setLocale('ru-RU').set({ weekday: 1 }).startOf('day')
            .minus({ days: 7 * Math.abs(offset) })
        }

        for ( let i = 0; i < 6; i++ ) {
            array.push(await this.lessons({
                date: local.plus({ day: i }).toFormat('dd.LL.yyyy'),
                group: params.group,
                week: offset
            }))
        }

        return array
    }
    public readonly lessons = async (params: { date: string, group: string, week?: number }): Promise<ILesson> => {
        try {
            const date = params.date,
                group = params.group

            const timetable = (await this.query(`getRaspisanGroups/${ date }/${ group }`, {
                method: 'post'
            })).data.map((lesson: { [x: string]: any; }) => {
                return {
                    number: parseInt(lesson["Para"]) || undefined,
                    discipline: lesson["discip"] || undefined,
                    teacher: lesson["prep"] || undefined,
                    cabinet: lesson['cab'] || undefined
                }
            })

            return {
                date: DateTime.fromFormat(date, 'dd.LL.yyyy').setZone('Asia/Yekaterinburg').toISO() || undefined,
                group: group || undefined,
                week: params.week || undefined,
                data: timetable || [],
            }
        } catch ( e ) {
            return e
        }
    }
}