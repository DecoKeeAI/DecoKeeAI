<template>
    <div>
        <img v-if="!isSVGData" ref="iconImg" data-src="" :style="iconSize" :title="title" alt="Icon" />
        <div v-else ref="svgContainer"></div>
    </div>
</template>

<script>
export default {
    name: 'IconHolder',
    props: {
        imgSrc: {
            type: String,
            default: '',
            required: false,
        },
        iconSrc: {
            type: String,
            default: '',
            required: false,
        },
        iconSize: {
            type: Object,
        },
        title: {
            type: String,
        },
        loadOnInitial: {
            type: Boolean,
            default: true,
        },
        releaseOnHide: {
            type: Boolean,
            default: false,
        },
    },
    watch: {
        imgSrc: function (newValue) {
            this.imageUri = this.getSrcPath(newValue, false);

            console.log('IconHolder; imgSrc changed: ', newValue)

            if (!this.iconVisible) return;
            if (this.isSVGData) {
                this.loadSVGData(this.imageUri);
            } else {
                this.$refs.iconImg.src = this.imageUri;
            }
        },
        iconSrc: function (newValue) {
            this.imageUri = this.getSrcPath(newValue, true);

            if (!this.iconVisible) return;
            if (this.isSVGData) {
                this.loadSVGData(this.imageUri);
            } else {
                this.$refs.iconImg.src = this.imageUri;
            }
        },
    },
    mounted() {
        this.$nextTick(() => {
            this.loadImgSrc();

            if (this.loadOnInitial) {
                if (this.isSVGData) {
                    this.loadSVGData(this.imageUri);
                } else {
                    this.$refs.iconImg.src = this.imageUri;
                }
                this.iconVisible = true;
            } else {
                setTimeout(() => {
                    this.observer = new IntersectionObserver(
                        entries => {
                            const img = entries[0].target;
                            // console.log('Img observeChange: isIntersecting: ', entries[0].isIntersecting);

                            this.iconVisible = entries[0].isIntersecting;
                            if (entries[0].isIntersecting) {
                                this.loadImgSrc();
                                if (this.isSVGData) {
                                    this.loadSVGData(this.imageUri);
                                } else {
                                    img.src = this.imageUri;
                                }
                            } else {
                                if (this.releaseOnHide) {
                                    img.src = '';
                                    this.loadSVGData('');
                                }
                            }
                        },
                        {
                            threshold: 0.5,
                        }
                    );
                    if (this.isSVGData) {
                        this.observer.observe(this.$refs.svgContainer);
                    } else {
                        this.observer.observe(this.$refs.iconImg);
                    }
                }, 300)
            }
        });
    },
    beforeDestroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    },
    data() {
        return {
            isSVGData: false,
            imageUri: '',
            iconVisible: false,
            observer: undefined
        };
    },
    methods: {
        forceReload() {
            this.iconVisible = true;
            this.loadImgSrc();
            if (this.isSVGData) {
                this.loadSVGData('');
                this.loadSVGData(this.imageUri);
            } else {
                this.$refs.iconImg.src = '';
                this.$refs.iconImg.src = this.imageUri;
            }
        },
        loadSVGData(svgIconPath) {
            if (svgIconPath === '') {
                if (this.$refs.svgContainer) {
                    this.$refs.svgContainer.innerHTML = '';
                }
            } else {
                fetch(svgIconPath)
                    .then(response => response.text())
                    .then(data => {
                        if (this.$refs.svgContainer) {
                            this.$refs.svgContainer.innerHTML = data;
                            this.updateSvgColor();
                        }
                    });
            }
        },
        updateSvgColor() {
            const svgElement = this.$refs.svgContainer.querySelector('svg');
            if (svgElement) {
                svgElement.setAttribute('fill', 'white');
                svgElement.setAttribute('style', 'width: ' + this.iconSize.width + '; height: ' + this.iconSize.height);
            }
        },
        loadImgSrc() {
            if (this.iconSrc !== '') {
                this.imageUri = this.getSrcPath(this.iconSrc, true);
            } else if (this.imgSrc !== '') {
                this.imageUri = this.getSrcPath(this.imgSrc, false);
            }
        },
        getSrcPath(imgUri, byResource) {
            if (byResource) {
                this.isSVGData = false;

                const resourceManager = window.resourcesManager;
                const resourceInfo = resourceManager.getResourceInfo(imgUri);
                if (resourceInfo === null) {
                    return '';
                }

                return window.resourcesManager.getRelatedSrcPath(resourceInfo.path);
            } else {
                if (!imgUri) return '';

                if (imgUri.startsWith('@mdi/')) {
                    this.isSVGData = true;
                    return window.resourcesManager.getNodeModuleResourceRelatedPath(imgUri);
                }
                this.isSVGData = false;

                if (!imgUri.startsWith('@/')) {
                    return imgUri;
                }

                return window.resourcesManager.getRelatedSrcPath(imgUri);
            }
        }
    },
};
</script>

<style scoped></style>
